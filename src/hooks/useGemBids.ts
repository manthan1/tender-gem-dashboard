import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface GemBid {
  id: number;
  bid_id?: number; // Added this property as optional since not all bids might have it
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
  useKeywordFiltering?: boolean;
}

// Global cache for storing fetched data to prevent redundant API calls
const dataCache = new Map<string, { data: GemBid[], count: number, timestamp: number }>();
const filterOptionsCache = new Map<string, { options: string[], timestamp: number }>();
const CACHE_EXPIRY = 10 * 60 * 1000; // 10 minutes cache expiry
const OPTIONS_CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes for filter options

// Cache key generator
const generateCacheKey = (page: number, filters: Filters, userId?: string) => {
  return `page_${page}_${userId}_${JSON.stringify(filters)}`;
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
  const [hasKeywords, setHasKeywords] = useState<boolean | null>(null);
  const isMounted = useRef(true);
  const debounceTimerRef = useRef<number | null>(null);
  const initialLoadComplete = useRef(false);
  
  const pageSize = 20;

  // Clear debounce timer when component unmounts
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Check if user has keywords
  const checkUserKeywords = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase.rpc('get_user_keywords', {
        p_user_id: user.id
      });
      
      if (error) throw error;
      
      const keywords = data || [];
      setHasKeywords(keywords.length > 0);
    } catch (err) {
      console.error('Error checking user keywords:', err);
      setHasKeywords(false);
    }
  }, [user?.id]);

  // Stable fetchBids function with deduplication
  const fetchBids = useCallback(async (skipLoading = false) => {
    if (!isAuthenticated || !user?.id) {
      console.log("User not authenticated, skipping data fetch");
      setLoading(false);
      setBids([]);
      setTotalCount(0);
      return;
    }
    
    // Generate cache key for this specific query
    const cacheKey = generateCacheKey(page, filters, user.id);
    
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
      
      // Prepare parameters for the database function
      const params = {
        p_user_id: user.id,
        p_page: page,
        p_page_size: pageSize,
        p_ministry: filters.ministry || null,
        p_department: filters.department || null,
        p_search: filters.search || null,
        p_start_date: filters.dateRange?.from?.toISOString() || null,
        p_end_date: filters.dateRange?.to?.toISOString() || null,
        p_use_keywords: filters.useKeywordFiltering !== false // Default to true
      };
      
      console.log("Fetching data with params:", params);
      
      // Call the database function
      const requestPromise = Promise.resolve(
        supabase.rpc('get_filtered_tenders', params)
      );
      
      ongoingRequests.set(cacheKey, requestPromise);
      
      const { data, error: fetchError } = await requestPromise;
      
      // Remove from ongoing requests
      ongoingRequests.delete(cacheKey);

      if (fetchError) {
        console.error("Database function error:", fetchError);
        throw fetchError;
      }
      
      // Extract data and count from the function result
      const tendersData = data || [];
      const count = tendersData.length > 0 ? tendersData[0].total_count : 0;
      
      // Transform the data to match our interface
      const transformedData = tendersData.map((tender: any) => ({
        id: tender.id,
        bid_id: tender.bid_id,
        bid_number: tender.bid_number,
        category: tender.category,
        quantity: tender.quantity,
        ministry: tender.ministry,
        department: tender.department,
        start_date: tender.start_date,
        end_date: tender.end_date,
        download_url: tender.download_url,
        bid_url: tender.bid_url
      }));
      
      console.log("Received data:", transformedData.length, "rows, count:", count);
      
      if (isMounted.current) {
        // Cache the results
        dataCache.set(cacheKey, {
          data: transformedData,
          count: count,
          timestamp: Date.now()
        });
        
        setBids(transformedData);
        setTotalCount(count);
        setLoading(false);
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
  }, [page, filters, pageSize, user?.id, isAuthenticated]);

  // Add explicit refetch function that will clear cache
  const refetch = useCallback(() => {
    // Clear all cache to force fresh data
    dataCache.clear();
    filterOptionsCache.clear();
    
    // Also clear any ongoing requests
    ongoingRequests.forEach((_, key) => {
      ongoingRequests.delete(key);
    });
    
    // Start fresh fetch
    console.log("Refetching all data...");
    return fetchBids(false);
  }, [fetchBids]);

  // Check user keywords on mount and when user changes
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      checkUserKeywords();
    }
  }, [isAuthenticated, user?.id, checkUserKeywords]);

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
      dataCache.clear();
      filterOptionsCache.clear();
      
      // Immediate fetch when user is authenticated
      fetchBids();
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
    hasKeywords,
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
