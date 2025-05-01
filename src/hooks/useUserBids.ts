
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface UserBid {
  id: string;
  tender_id: number;
  bid_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // We'll join tender information for display purposes
  tender?: {
    bid_number: string;
    category: string;
    ministry: string;
    department: string;
  };
}

export const useUserBids = () => {
  const [bids, setBids] = useState<UserBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  const fetchUserBids = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      setBids([]);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch user bids with tender information using a join
      const { data, error } = await supabase
        .from("user_bids")
        .select(`
          id,
          tender_id,
          bid_amount,
          notes,
          created_at,
          updated_at,
          tenders_gem:tender_id (
            bid_number,
            category,
            ministry,
            department
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      // Format the data to match our interface
      const formattedBids: UserBid[] = data.map((bid: any) => ({
        id: bid.id,
        tender_id: bid.tender_id,
        bid_amount: bid.bid_amount,
        notes: bid.notes,
        created_at: bid.created_at,
        updated_at: bid.updated_at,
        tender: bid.tenders_gem
      }));

      setBids(formattedBids);
    } catch (err: any) {
      console.error("Error fetching user bids:", err);
      setError(err.message);
      toast({
        title: "Error fetching your bids",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, toast]);

  const placeBid = useCallback(async (tenderId: number, bidAmount: number, notes?: string) => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication required",
        description: "Please log in to place a bid",
        variant: "destructive",
      });
      return { success: false };
    }

    try {
      const { data, error } = await supabase
        .from("user_bids")
        .upsert({
          user_id: user.id,
          tender_id: tenderId,
          bid_amount: bidAmount,
          notes: notes || null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,tender_id'
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Bid placed successfully",
        description: "Your bid has been recorded",
        variant: "default",
      });

      // Refresh the bids list
      fetchUserBids();
      
      return { success: true };
    } catch (err: any) {
      console.error("Error placing bid:", err);
      toast({
        title: "Error placing bid",
        description: err.message,
        variant: "destructive",
      });
      return { success: false, error: err.message };
    }
  }, [isAuthenticated, user, toast, fetchUserBids]);

  useEffect(() => {
    fetchUserBids();
  }, [fetchUserBids]);

  return {
    bids,
    loading,
    error,
    fetchUserBids,
    placeBid
  };
};
