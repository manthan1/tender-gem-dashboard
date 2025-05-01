
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface AdminBid {
  id: string;
  bid_amount: number;
  created_at: string;
  notes: string | null;
  tender_id: number;
  user_id: string;
  user_email?: string;
  tenders_gem?: {
    bid_number: string;
    ministry: string;
    department: string;
  };
}

export const AdminBidsTable: React.FC = () => {
  const [bids, setBids] = useState<AdminBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBids = async () => {
      try {
        setLoading(true);
        
        // First, fetch bids with tender information but without user details
        const { data: bidsData, error: bidsError } = await supabase
          .from("user_bids")
          .select(`
            id,
            bid_amount,
            notes,
            created_at,
            tender_id,
            user_id,
            tenders_gem:tender_id (
              bid_number,
              ministry,
              department
            )
          `);
        
        if (bidsError) throw bidsError;
        
        // Now, for each bid, get the user email from auth.users
        // We'll use separate queries since we can't directly join with auth.users
        const bidsWithUserInfo = await Promise.all(
          bidsData.map(async (bid: any) => {
            // Get user email from profiles or auth metadata if available
            const { data: userData, error: userError } = await supabase
              .from("profiles")
              .select("username, full_name")
              .eq("id", bid.user_id)
              .single();
            
            return {
              ...bid,
              user_email: userData?.username || "Unknown User",
            };
          })
        );
        
        setBids(bidsWithUserInfo);
      } catch (err: any) {
        console.error("Error fetching admin bids:", err);
        setError(err.message);
        toast({
          title: "Error",
          description: "Failed to load bids: " + err.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading bids...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-destructive">
        <XCircle className="h-8 w-8 mx-auto mb-2" />
        <p>Failed to load bids: {error}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Tender</TableHead>
            <TableHead>Bid Amount</TableHead>
            <TableHead>Ministry</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bids.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No bids have been placed yet.
              </TableCell>
            </TableRow>
          ) : (
            bids.map((bid) => (
              <TableRow key={bid.id}>
                <TableCell>{bid.user_email}</TableCell>
                <TableCell>{bid.tenders_gem?.bid_number || "Unknown"}</TableCell>
                <TableCell>₹{bid.bid_amount.toLocaleString()}</TableCell>
                <TableCell>{bid.tenders_gem?.ministry || "Not specified"}</TableCell>
                <TableCell>{bid.tenders_gem?.department || "Not specified"}</TableCell>
                <TableCell>
                  {format(new Date(bid.created_at), "dd MMM yyyy")}
                </TableCell>
                <TableCell>{bid.notes || "-"}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
