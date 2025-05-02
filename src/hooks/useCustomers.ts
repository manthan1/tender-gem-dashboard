
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Type definitions
// src/hooks/useCustomers.ts

export interface Customer {
  id: string;
  name: string;
  // user_id?: string; // Remove or comment out this line if you deleted the column
  // If you made it optional, you can keep it as user_id?: string;
  created_at: string;
}

// ... rest of the file

export interface CustomerKeyword {
  id: string;
  customer_id: string;
  keyword: string;
  created_at: string;
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch all customers
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("name");

      if (error) throw error;
      setCustomers(data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError("Failed to load customers");
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch keywords for a specific customer
  const fetchKeywordsForCustomer = useCallback(
    async (customerId: string) => {
      try {
        const { data, error } = await supabase
          .from("customer_keywords")
          .select("*")
          .eq("customer_id", customerId)
          .order("keyword");

        if (error) throw error;
        return data || [];
      } catch (err) {
        console.error(`Error fetching keywords for customer ${customerId}:`, err);
        toast({
          title: "Error",
          description: "Failed to load keywords",
          variant: "destructive",
        });
        return [];
      }
    },
    [toast]
  );


  // Add a new customer
  const addCustomer = useCallback(
    async (name: string) => {
      try {
        // Remove the user_id field from the insert object
        const { data, error } = await supabase
          .from("customers").insert({
            name, // Only insert the name
            // user_id: defaultUserId // Remove this line
          })
          .select()
          .single();

        if (error) {
          console.error("Error adding customer:", error);
          // Update error message if needed, as user_id is no longer the cause
          toast({
            title: "Error",
            description: `Failed to add customer: ${error.message}`, // More specific error
            variant: "destructive",
          });
          return null;
        }

        toast({
          title: "Success",
          description: "Customer added successfully",
        });

        await fetchCustomers();
        return data;
      } catch (err) {
        console.error("Error adding customer:", err);
        toast({
          title: "Error",
          description: "Failed to add customer",
          variant: "destructive",
        });
        return null;
      }
    },
    [fetchCustomers, toast]
  );

// ... rest of the hook


  // Update an existing customer
  const updateCustomer = useCallback(
    async (id: string, name: string) => {
      try {
        const { error } = await supabase
          .from("customers")
          .update({ name })
          .eq("id", id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Customer updated successfully",
        });
        
        await fetchCustomers();
        return true;
      } catch (err) {
        console.error("Error updating customer:", err);
        toast({
          title: "Error",
          description: "Failed to update customer",
          variant: "destructive",
        });
        return false;
      }
    },
    [fetchCustomers, toast]
  );

  // Delete a customer
  const deleteCustomer = useCallback(
    async (id: string) => {
      try {
        const { error } = await supabase
          .from("customers")
          .delete()
          .eq("id", id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Customer deleted successfully",
        });
        
        await fetchCustomers();
        return true;
      } catch (err) {
        console.error("Error deleting customer:", err);
        toast({
          title: "Error",
          description: "Failed to delete customer",
          variant: "destructive",
        });
        return false;
      }
    },
    [fetchCustomers, toast]
  );

  // Add a keyword for a customer
  const addKeyword = useCallback(
    async (customerId: string, keyword: string) => {
      try {
        const { data, error } = await supabase
          .from("customer_keywords")
          .insert({ customer_id: customerId, keyword })
          .select()
          .single();

        if (error) {
          // Check for unique constraint violation
          if (error.code === "23505") {
            toast({
              title: "Error",
              description: "This keyword already exists for the customer",
              variant: "destructive",
            });
          } else {
            throw error;
          }
          return null;
        }
        
        toast({
          title: "Success",
          description: "Keyword added successfully",
        });
        
        return data;
      } catch (err) {
        console.error("Error adding keyword:", err);
        toast({
          title: "Error",
          description: "Failed to add keyword",
          variant: "destructive",
        });
        return null;
      }
    },
    [toast]
  );

  // Delete a keyword
  const deleteKeyword = useCallback(
    async (keywordId: string) => {
      try {
        const { error } = await supabase
          .from("customer_keywords")
          .delete()
          .eq("id", keywordId);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Keyword deleted successfully",
        });
        
        return true;
      } catch (err) {
        console.error("Error deleting keyword:", err);
        toast({
          title: "Error",
          description: "Failed to delete keyword",
          variant: "destructive",
        });
        return false;
      }
    },
    [toast]
  );

  // Fetch customers on initial load
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    fetchKeywordsForCustomer,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addKeyword,
    deleteKeyword,
  };
}
