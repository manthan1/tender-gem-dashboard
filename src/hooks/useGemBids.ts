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

// Track ongoing requests to prevent duplicates
const ongoingRequests = new Map<string, Promise<any>>();

export const useGemBids = (
  page: number,
  filters: Filters = {}
) => {
  const [bids, setBids] = useState<GemBid[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);
  const debounceTimerRef = useRef<number | null>(null);
  const initialLoadComplete = useRef(false);
  
  const pageSize = 20; // Changed from 10 to 20
  const start = (page - 1) * pageSize;

  // Clear debounce timer when component unmounts
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Stable fetchBids function with deduplication
  const fetchBids = useCallback(async (skipLoading = false) => {
    // Generate cache key for this specific query
    const cacheKey = generateCacheKey(page, filters);
    
    try {
      // First check cache
      const cachedData = dataCache.get(cacheKey);
      if (cachedData && Date.now() - cachedData.timestamp < CACHE_EXPIRY) {
        console.log("Using cached data for:", cacheKey);
        if (isMounted.current) {
          setBids(cachedData.data);
          setTotalCount(cachedData.count);
          setLoading(false);
          initialLoadComplete.current = true;
        }
        return;
      }
      
      // If there's already an ongoing request for this exact data, use it
      if (ongoingRequests.has(cacheKey)) {
        console.log("Using existing request for:", cacheKey);
        try {
          await ongoingRequests.get(cacheKey);
          // This will set loading to false after the request completes
          return;
        } catch (err) {
          // If the shared request failed, continue to make a new one
          console.log("Shared request failed, making new one");
        }
      }
      
      // Create the query
      let query = supabase
        .from("tenders_gem")
        .select("*", { count: "exact" });

      // Apply filters
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
      
      // Add range and ordering
      query = query
        .range(start, start + pageSize - 1)
        .order("start_date", { ascending: false });
        
      // Store the promise of the executed query in ongoing requests
      // Convert PromiseLike to full Promise using Promise.resolve
      const requestPromise = Promise.resolve(query.then((result) => {
        return result;
      }));
      
      ongoingRequests.set(cacheKey, requestPromise);
      
      const { data, error, count } = await requestPromise;
      
      // Remove from ongoing requests
      ongoingRequests.delete(cacheKey);

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
        
        // Update state only if still mounted
        setLoading(false);
        setBids(data || []);
        setTotalCount(count || 0);
        initialLoadComplete.current = true;
      }
    } catch (err: any) {
      // Clean up ongoing request on error
      ongoingRequests.delete(cacheKey);
      
      console.error("Error fetching gem bids:", err);
      if (isMounted.current) {
        setLoading(false);
        setError(err.message);
      }
    }
  }, [page, filters, pageSize, start]);

  // Primary effect for data fetching with proper dependencies
  useEffect(() => {
    isMounted.current = true;
    
    // Skip loading state for very quick cache hits
    const cacheKey = generateCacheKey(page, filters);
    const cachedData = dataCache.get(cacheKey);
    
    // Only show loading for completely new data, not cached data
    if (!cachedData) {
      setLoading(true);
    }
    
    // Debounce data fetching
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Different debounce times for different triggers
    const debounceTime = filters.search ? 300 : 100; // 300ms for search, 100ms for other changes
    
    debounceTimerRef.current = window.setTimeout(() => {
      fetchBids();
      debounceTimerRef.current = null;
    }, debounceTime);
    
    return () => {
      isMounted.current = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [fetchBids]);

  // Separate effect for prefetching next page - only run when appropriate
  useEffect(() => {
    // Only prefetch next page when current page data is loaded and stable
    if (bids.length > 0 && !loading && initialLoadComplete.current) {
      const nextPage = page + 1;
      const nextCacheKey = generateCacheKey(nextPage, filters);
      
      // Only prefetch if not already cached and not already in progress
      if (!dataCache.has(nextCacheKey) && !ongoingRequests.has(nextCacheKey)) {
        // Wait a bit before prefetching to ensure it doesn't interfere with current rendering
        const prefetchTimer = setTimeout(() => {
          // Check cache again in case it was populated during the timeout
          if (!dataCache.has(nextCacheKey) && !ongoingRequests.has(nextCacheKey)) {
            console.log("Prefetching next page:", nextPage);
            
            // Create the query but wrap it with a promise for execution
            let query = supabase
              .from("tenders_gem")
              .select("*", { count: "exact" });
              
            // Apply same filters
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
            
            // Add range and ordering for the next page
            query = query
              .range((nextPage - 1) * pageSize, nextPage * pageSize - 1)
              .order("start_date", { ascending: false });
              
            // Create and store the promise in ongoing requests
            // Convert PromiseLike to full Promise using Promise.resolve
            const prefetchPromise = Promise.resolve(query.then(result => result));
            ongoingRequests.set(nextCacheKey, prefetchPromise);
            
            // Execute in background
            prefetchPromise.then(({data, count}) => {
              ongoingRequests.delete(nextCacheKey);
              if (data && count !== null) {
                dataCache.set(nextCacheKey, {
                  data,
                  count,
                  timestamp: Date.now()
                });
              }
            }).catch(() => {
              ongoingRequests.delete(nextCacheKey);
            });
          }
        }, 1500); // Longer delay for prefetching
        
        return () => clearTimeout(prefetchTimer);
      }
    }
  }, [bids, loading, page, filters, pageSize]);

  return {
    bids,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    loading,
    error,
  };
};

// Optimized hook to fetch filter options
export const useFilterOptions = (field: "ministry" | "department") => {
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const requestRef = useRef<Promise<any> | null>(null);
  const initialLoadComplete = useRef(false);

  useEffect(() => {
    let isMounted = true;
    
    // Check cache first
    const cachedOptions = filterOptionsCache.get(field);
    if (cachedOptions && 
        Date.now() - cachedOptions.timestamp < OPTIONS_CACHE_EXPIRY) {
      setOptions(cachedOptions.options);
      setLoading(false);
      initialLoadComplete.current = true;
      return;
    }
    
    // If first load already happened, avoid duplicate requests
    if (requestRef.current && initialLoadComplete.current) {
      return;
    }
    
    const fetchOptions = async () => {
      if (requestRef.current) return;
      
      try {
        console.log(`Fetching ${field} options`);
        
        // Create and execute the query in one step
        // Convert PromiseLike to full Promise using Promise.resolve
        const promise = Promise.resolve(
          supabase
            .from("tenders_gem")
            .select(field)
            .order(field)
            .then(result => result)
        );
          
        requestRef.current = promise;
        
        const { data, error } = await promise;
        requestRef.current = null;

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
          initialLoadComplete.current = true;
        }
      } catch (err) {
        requestRef.current = null;
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
