
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
  const { isAuthenticated, user } = useAuth();
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
    if (!isAuthenticated) {
      console.log("User not authenticated, skipping data fetch");
      setLoading(false);
      return;
    }
    
    // Generate cache key for this specific query
    const cacheKey = generateCacheKey(page, filters);
    
    try {
      // Set loading state unless told to skip it (for refetches/background updates)
      if (!skipLoading) {
        setLoading(true);
      }
      
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
      const requestPromise = Promise.resolve(query);
      
      ongoingRequests.set(cacheKey, requestPromise);
      
      console.log("Fetching data from Supabase:", cacheKey);
      const { data, error: fetchError, count } = await requestPromise;
      
      // Remove from ongoing requests
      ongoingRequests.delete(cacheKey);

      if (fetchError) {
        console.error("Supabase query error:", fetchError);
        throw fetchError;
      }
      
      console.log("Received data:", data?.length || 0, "rows, count:", count);
      
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
        setError(null);
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
  }, [page, filters, pageSize, start, isAuthenticated, user]);

  // Add explicit refetch function that will clear cache
  const refetch = useCallback(() => {
    // Clear cache for this query to force fresh data
    const cacheKey = generateCacheKey(page, filters);
    dataCache.delete(cacheKey);
    
    // Also clear any ongoing request for this data
    if (ongoingRequests.has(cacheKey)) {
      ongoingRequests.delete(cacheKey);
    }
    
    // Start fresh fetch
    return fetchBids(false);
  }, [fetchBids, page, filters]);

  // Primary effect for data fetching with proper dependencies
  useEffect(() => {
    isMounted.current = true;
    
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    
    // Check if the user just became authenticated
    if (isAuthenticated && user) {
      // Clear any cached data to ensure fresh load after authentication
      const cacheKey = generateCacheKey(page, filters);
      dataCache.delete(cacheKey);
      
      // Immediate fetch when user is authenticated
      fetchBids();
    } else if (!isAuthenticated) {
      setLoading(false);
    }
    
    return () => {
      isMounted.current = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [fetchBids, isAuthenticated, user]);

  // Separate effect for handling changes to filters or page
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    
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
    
  }, [page, filters, fetchBids, isAuthenticated]);

  return {
    bids,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    loading,
    error,
    refetch, // Expose the refetch function
  };
};

// Optimized hook to fetch filter options
export const useFilterOptions = (field: "ministry" | "department") => {
  const { isAuthenticated } = useAuth();
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const requestRef = useRef<Promise<any> | null>(null);
  const initialLoadComplete = useRef(false);

  useEffect(() => {
    let isMounted = true;
    
    // Skip if not authenticated
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    
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
        const promise = Promise.resolve(
          supabase
            .from("tenders_gem")
            .select(field)
            .order(field)
        );
          
        requestRef.current = promise;
        
        const { data, error } = await promise;
        requestRef.current = null;

        if (error) {
          console.error(`Error fetching ${field} options:`, error);
          throw error;
        }
        
        console.log(`Received ${field} options:`, data?.length || 0);
        
        // Extract unique values
        const uniqueValues = [...new Set(data?.map(item => item[field]).filter(Boolean) || [])];
        
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
  }, [field, isAuthenticated]);

  return { options, loading };
};
