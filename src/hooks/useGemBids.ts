
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface GemBid {
  id: number;
  bid_number: string;
  category: string;
  quantity: number;
  ministry: string;
  department: string;
  start_date: string;
  end_date: string;
  download_url?: string;
  bid_url?: string;
}

interface Filters {
  ministry?: string;
  department?: string;
  dateRange?: {
    from: Date | null;
    to: Date | null;
  };
  search?: string;
}

// Cache for storing fetched data to prevent redundant API calls
const dataCache = new Map<string, { data: GemBid[], count: number, timestamp: number }>();
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes cache expiry

// Cache key generator
const generateCacheKey = (page: number, filters: Filters) => {
  return `page_${page}_${JSON.stringify(filters)}`;
};

export const useGemBids = (
  page: number,
  filters: Filters = {}
) => {
  const [bids, setBids] = useState<GemBid[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const activeRequest = useRef<AbortController | null>(null);
  const isMounted = useRef(true);
  
  const pageSize = 10;
  const start = (page - 1) * pageSize;
  
  // Memoized fetch function to prevent unnecessary renders
  const fetchBids = useCallback(async () => {
    try {
      // Generate cache key based on current page and filters
      const cacheKey = generateCacheKey(page, filters);
      
      // Check if we have valid cached data
      const cachedData = dataCache.get(cacheKey);
      if (cachedData && Date.now() - cachedData.timestamp < CACHE_EXPIRY) {
        console.log("Using cached data for:", cacheKey);
        if (isMounted.current) {
          setBids(cachedData.data);
          setTotalCount(cachedData.count);
          setLoading(false);
        }
        return;
      }
      
      // If cache miss or expired, proceed with fetch
      console.log("Fetching bids with filters:", filters);
      let query = supabase
        .from("tenders_gem")
        .select("*", { count: "exact" });

      // Apply filters if they exist
      if (filters.ministry) {
        query = query.eq("ministry", filters.ministry);
      }
      
      if (filters.department) {
        query = query.eq("department", filters.department);
      }
      
      if (filters.dateRange?.from) {
        query = query.gte("start_date", filters.dateRange.from.toISOString());
      }
      
      if (filters.dateRange?.to) {
        query = query.lte("start_date", filters.dateRange.to.toISOString());
      }
      
      if (filters.search) {
        query = query.or(
          `bid_number.ilike.%${filters.search}%,category.ilike.%${filters.search}%`
        );
      }
      
      const { data, error, count } = await query
        .range(start, start + pageSize - 1)
        .order("start_date", { ascending: false });

      if (error) throw error;
      
      if (isMounted.current) {
        // Cache the results
        if (data && count !== null) {
          dataCache.set(cacheKey, {
            data,
            count,
            timestamp: Date.now()
          });
        }
        
        // Set loading to false first, then update the data to prevent flickering
        setLoading(false);
        setBids(data || []);
        setTotalCount(count || 0);
      }
    } catch (err: any) {
      // Don't update state if the request was aborted
      if (err.name === 'AbortError') {
        console.log('Request was aborted');
        return;
      }
      
      console.error("Error fetching gem bids:", err);
      if (isMounted.current) {
        setLoading(false);
        setError(err.message);
      }
    }
  }, [page, filters]);

  useEffect(() => {
    isMounted.current = true;
    
    // Don't set loading to true immediately if we already have data
    // This prevents the "blinking" effect when changing filters or page
    const hasExistingData = bids.length > 0;
    
    // Check if we have cached data for this request
    const cacheKey = generateCacheKey(page, filters);
    const cachedData = dataCache.get(cacheKey);
    
    if (!cachedData) {
      // Only show loading if we don't have data in the cache
      if (!hasExistingData) {
        setLoading(true);
      }
    }
    
    // Cancel any in-flight requests to prevent race conditions
    if (activeRequest.current) {
      activeRequest.current.abort();
    }
    
    // Create a new abort controller for this request
    activeRequest.current = new AbortController();
    
    // Debounce the fetch operation to avoid rapid refetching
    const timeoutId = setTimeout(() => {
      fetchBids();
    }, 150); // Slightly increased debounce time
    
    return () => {
      clearTimeout(timeoutId);
      isMounted.current = false;
      if (activeRequest.current) {
        activeRequest.current.abort();
      }
    };
  }, [fetchBids]);

  // Pre-fetch the next page if we're near the end of the current page
  useEffect(() => {
    if (bids.length >= pageSize * 0.8) { // If we have 80% of the page loaded
      const nextPage = page + 1;
      const nextCacheKey = generateCacheKey(nextPage, filters);
      
      // Only prefetch if not already cached
      if (!dataCache.has(nextCacheKey)) {
        const prefetchNextPage = async () => {
          try {
            console.log("Prefetching next page:", nextPage);
            const { data, count } = await supabase
              .from("tenders_gem")
              .select("*", { count: "exact" })
              .range((nextPage - 1) * pageSize, nextPage * pageSize - 1)
              .order("start_date", { ascending: false });
              
            if (data && count !== null) {
              dataCache.set(nextCacheKey, {
                data,
                count,
                timestamp: Date.now()
              });
            }
          } catch (err) {
            console.log("Error prefetching next page:", err);
          }
        };
        
        // Run prefetch in the background
        prefetchNextPage();
      }
    }
  }, [bids, page, filters, pageSize]);

  return {
    bids,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    loading,
    error,
  };
};

// This is a utility hook to fetch unique values for filters
export const useFilterOptions = (field: "ministry" | "department") => {
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const optionsCache = useRef<Record<string, { values: string[], timestamp: number }>>({});
  const FILTER_CACHE_EXPIRY = 10 * 60 * 1000; // 10 minutes for filter options

  useEffect(() => {
    let isMounted = true;
    
    // If we have cached results that aren't expired, use them immediately
    if (optionsCache.current[field] && 
        Date.now() - optionsCache.current[field].timestamp < FILTER_CACHE_EXPIRY) {
      setOptions(optionsCache.current[field].values);
      setLoading(false);
      return;
    }
    
    const fetchOptions = async () => {
      try {
        console.log(`Fetching ${field} options`);
        // Get distinct values from the tenders_gem table
        const { data, error } = await supabase
          .from("tenders_gem")
          .select(field)
          .order(field);

        if (error) throw error;
        
        // Extract unique values
        const uniqueValues = [...new Set(data.map(item => item[field]).filter(Boolean))];
        
        // Cache the results with timestamp
        optionsCache.current[field] = {
          values: uniqueValues,
          timestamp: Date.now()
        };
        
        if (isMounted) {
          setOptions(uniqueValues);
          setLoading(false);
        }
      } catch (err) {
        console.error(`Error fetching ${field} options:`, err);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOptions();
    
    return () => {
      isMounted = false;
    };
  }, [field]);

  return { options, loading };
};
