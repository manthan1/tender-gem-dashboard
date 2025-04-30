
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

// Global cache for storing fetched data to prevent redundant API calls
const dataCache = new Map<string, { data: GemBid[], count: number, timestamp: number }>();
const filterOptionsCache = new Map<string, { options: string[], timestamp: number }>();
const CACHE_EXPIRY = 10 * 60 * 1000; // 10 minutes cache expiry
const OPTIONS_CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes for filter options

// Cache key generator
const generateCacheKey = (page: number, filters: Filters) => {
  return `page_${page}_${JSON.stringify(filters)}`;
};

// In-progress requests tracker to avoid duplicate calls
const pendingRequests = new Set<string>();

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
  const fetchTimerRef = useRef<number | null>(null);
  
  const pageSize = 10;
  const start = (page - 1) * pageSize;
  
  // Clear any pending fetch timer when component unmounts
  useEffect(() => {
    return () => {
      if (fetchTimerRef.current) {
        clearTimeout(fetchTimerRef.current);
      }
    };
  }, []);

  // Memoized fetch function with proper debounce and abort handling
  const fetchBids = useCallback(async () => {
    // Generate the cache key for this specific query
    const cacheKey = generateCacheKey(page, filters);
    
    // If this exact request is already in progress, don't start another one
    if (pendingRequests.has(cacheKey)) {
      console.log("Request already in progress, skipping duplicate:", cacheKey);
      return;
    }
    
    try {
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
      
      // Mark this request as in progress
      pendingRequests.add(cacheKey);
      
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

      // Remove from pending requests since it's complete
      pendingRequests.delete(cacheKey);

      if (error) throw error;
      
      if (isMounted.current) {
        // Cache the results
        if (data && count !== null) {
          console.log("Fetched data:", data);
          console.log("Count:", count);
          dataCache.set(cacheKey, {
            data,
            count,
            timestamp: Date.now()
          });
        }
        
        // Update state only if still mounted
        setLoading(false);
        setBids(data || []);
        setTotalCount(count || 0);
      }
    } catch (err: any) {
      // Remove from pending requests on error
      pendingRequests.delete(cacheKey);
      
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
    
    // Cancel any in-flight requests to prevent race conditions
    if (activeRequest.current) {
      activeRequest.current.abort();
    }
    
    // Create a new abort controller for this request
    activeRequest.current = new AbortController();
    
    // Generate cache key for this request
    const cacheKey = generateCacheKey(page, filters);
    const cachedData = dataCache.get(cacheKey);
    
    // Only show loading for completely new data, not cached data
    if (!cachedData) {
      setLoading(true);
    }
    
    // Use a timeout to debounce rapid filter/page changes
    if (fetchTimerRef.current) {
      clearTimeout(fetchTimerRef.current);
    }
    
    // Use window.setTimeout to get a numeric ID instead of NodeJS.Timeout
    fetchTimerRef.current = window.setTimeout(() => {
      fetchBids();
    }, 200); // 200ms debounce time
    
    return () => {
      isMounted.current = false;
      if (activeRequest.current) {
        activeRequest.current.abort();
      }
      if (fetchTimerRef.current) {
        clearTimeout(fetchTimerRef.current);
      }
    };
  }, [fetchBids]);

  // Only run prefetch for the next page when appropriate and not for every render
  useEffect(() => {
    // Only prefetch if we have data and it's a reasonable amount (80% of current page)
    if (bids.length >= pageSize * 0.8 && !loading) {
      const nextPage = page + 1;
      const nextCacheKey = generateCacheKey(nextPage, filters);
      
      // Only prefetch if not already cached and not already in progress
      if (!dataCache.has(nextCacheKey) && !pendingRequests.has(nextCacheKey)) {
        const prefetchNextPage = async () => {
          try {
            // Mark as in progress
            pendingRequests.add(nextCacheKey);
            
            console.log("Prefetching next page:", nextPage);
            const { data, count } = await supabase
              .from("tenders_gem")
              .select("*", { count: "exact" })
              .range((nextPage - 1) * pageSize, nextPage * pageSize - 1)
              .order("start_date", { ascending: false });
              
            // Remove from pending requests
            pendingRequests.delete(nextCacheKey);
            
            if (data && count !== null) {
              dataCache.set(nextCacheKey, {
                data,
                count,
                timestamp: Date.now()
              });
            }
          } catch (err) {
            pendingRequests.delete(nextCacheKey);
            console.log("Error prefetching next page:", err);
          }
        };
        
        // Use a small timeout to avoid interfering with the main page load
        setTimeout(prefetchNextPage, 1000);
      }
    }
  }, [bids, page, filters, pageSize, loading]);

  return {
    bids,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    loading,
    error,
  };
};

// This is a utility hook to fetch unique values for filters with improved caching
export const useFilterOptions = (field: "ministry" | "department") => {
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const requestRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    // If we have a previous request in progress, abort it
    if (requestRef.current) {
      requestRef.current.abort();
    }
    requestRef.current = new AbortController();
    
    // If we have cached results that aren't expired, use them immediately
    const cachedOptions = filterOptionsCache.get(field);
    if (cachedOptions && 
        Date.now() - cachedOptions.timestamp < OPTIONS_CACHE_EXPIRY) {
      setOptions(cachedOptions.options);
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
        filterOptionsCache.set(field, {
          options: uniqueValues,
          timestamp: Date.now()
        });
        
        if (isMounted) {
          setOptions(uniqueValues);
          setLoading(false);
        }
      } catch (err) {
        // Only log actual errors, not aborts
        if (err.name !== 'AbortError') {
          console.error(`Error fetching ${field} options:`, err);
        }
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOptions();
    
    return () => {
      isMounted = false;
      if (requestRef.current) {
        requestRef.current.abort();
      }
    };
  }, [field]);

  return { options, loading };
};
