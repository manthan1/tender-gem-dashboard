
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface CustomerKeyword {
  id: string;
  customer_name: string;
  keywords: string[];
  created_at: string;
  updated_at: string;
}

export const useCustomerKeywords = () => {
  const { isAuthenticated, user } = useAuth();
  const [customerKeywords, setCustomerKeywords] = useState<CustomerKeyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCustomerKeywords = async () => {
    if (!isAuthenticated || !user) {
      setCustomerKeywords([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("customer_keywords")
        .select("*")
        .order("customer_name", { ascending: true });

      if (error) {
        throw error;
      }

      setCustomerKeywords(data || []);
    } catch (err: any) {
      console.error("Error fetching customer keywords:", err);
      setError(err.message);
      toast({
        title: "Error fetching customer data",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addCustomerKeyword = async (customerName: string, keywords: string[]) => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication required",
        description: "Please log in to add customer keywords",
        variant: "destructive",
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("customer_keywords")
        .insert({
          user_id: user.id,
          customer_name: customerName,
          keywords: keywords,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setCustomerKeywords((prev) => [...prev, data]);
      toast({
        title: "Customer added",
        description: `${customerName} has been added successfully`,
      });
      
      return data;
    } catch (err: any) {
      console.error("Error adding customer keyword:", err);
      toast({
        title: "Error adding customer",
        description: err.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const updateCustomerKeyword = async (id: string, customerName: string, keywords: string[]) => {
    if (!isAuthenticated) {
      return false;
    }

    try {
      const { error } = await supabase
        .from("customer_keywords")
        .update({
          customer_name: customerName,
          keywords: keywords,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        throw error;
      }

      setCustomerKeywords((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, customer_name: customerName, keywords, updated_at: new Date().toISOString() }
            : item
        )
      );

      toast({
        title: "Customer updated",
        description: `${customerName} has been updated successfully`,
      });
      
      return true;
    } catch (err: any) {
      console.error("Error updating customer keyword:", err);
      toast({
        title: "Error updating customer",
        description: err.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteCustomerKeyword = async (id: string, customerName: string) => {
    if (!isAuthenticated) {
      return false;
    }

    try {
      const { error } = await supabase
        .from("customer_keywords")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      setCustomerKeywords((prev) => prev.filter((item) => item.id !== id));
      
      toast({
        title: "Customer deleted",
        description: `${customerName} has been removed`,
      });
      
      return true;
    } catch (err: any) {
      console.error("Error deleting customer keyword:", err);
      toast({
        title: "Error deleting customer",
        description: err.message,
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchCustomerKeywords();
  }, [isAuthenticated, user]);

  return {
    customerKeywords,
    loading,
    error,
    addCustomerKeyword,
    updateCustomerKeyword,
    deleteCustomerKeyword,
    refreshCustomerKeywords: fetchCustomerKeywords,
  };
};
