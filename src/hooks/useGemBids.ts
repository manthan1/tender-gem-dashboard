
import { useState, useEffect, useRef } from "react";
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

export const useGemBids = (
  page: number,
  filters: Filters = {}
) => {
  const [bids, setBids] = useState<GemBid[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const activeRequest = useRef<AbortController | null>(null);
  
  const pageSize = 10;
  const start = (page - 1) * pageSize;
  
  useEffect(() => {
    let isMounted = true;
    
    // Don't set loading to true immediately if we already have data
    // This prevents the "blinking" effect when changing filters or page
    const hasExistingData = bids.length > 0;
    if (!hasExistingData) {
      setLoading(true);
    }
    
    // Cancel any in-flight requests to prevent race conditions
    if (activeRequest.current) {
      activeRequest.current.abort();
    }
    
    // Create a new abort controller for this request
    activeRequest.current = new AbortController();
    
    const fetchBids = async () => {
      try {
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

        console.log("Fetched data:", data);
        console.log("Error:", error);
        console.log("Count:", count);

        if (error) throw error;
        
        if (isMounted) {
          // Set loading to false first, then update the data
          // This sequence helps prevent flickering
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
        if (isMounted) {
          setLoading(false);
          setError(err.message);
        }
      }
    };

    // Use a small timeout to debounce frequent changes
    const timeoutId = setTimeout(() => {
      fetchBids();
    }, 100);
    
    return () => {
      clearTimeout(timeoutId);
      isMounted = false;
      if (activeRequest.current) {
        activeRequest.current.abort();
      }
    };
  }, [page, filters]);

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
  const optionsCache = useRef<Record<string, string[]>>({});

  useEffect(() => {
    let isMounted = true;
    
    // If we have cached results, use them immediately
    if (optionsCache.current[field]) {
      setOptions(optionsCache.current[field]);
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
        
        // Cache the results
        optionsCache.current[field] = uniqueValues;
        
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
