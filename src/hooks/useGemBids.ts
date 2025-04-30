
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface GemBid {
  id: number; // Changed from string to number to match Supabase schema
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
  
  const pageSize = 10;
  const start = (page - 1) * pageSize;
  
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
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
          setBids(data || []);
          setTotalCount(count || 0);
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Error fetching gem bids:", err);
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchBids();
    
    return () => {
      isMounted = false;
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

  useEffect(() => {
    let isMounted = true;
    
    const fetchOptions = async () => {
      setLoading(true);
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
