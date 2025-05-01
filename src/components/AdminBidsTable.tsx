
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface AdminBid {
  id: string;
  bid_amount: number;
  created_at: string;
  notes: string | null;
  tender_id: number;
  user: {
    id: string;
    email: string;
  };
  tender: {
    bid_number: string;
    ministry: string;
    department: string;
  };
}

export const AdminBidsTable: React.FC = () => {
  const [bids, setBids] = useState<AdminBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
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
            ),
            auth:user_id (
              id,
              email
            )
          `);
        
        if (error) throw error;
        
        // Transform the data to match our AdminBid interface
        const formattedBids = data.map((bid: any) => ({
          id: bid.id,
          bid_amount: bid.bid_amount,
          created_at: bid.created_at,
          notes: bid.notes,
          tender_id: bid.tender_id,
          user: {
            id: bid.auth?.id || "Unknown",
            email: bid.auth?.email || "Unknown",
          },
          tender: {
            bid_number: bid.tenders_gem?.bid_number || "Unknown",
            ministry: bid.tenders_gem?.ministry || "Unknown",
            department: bid.tenders_gem?.department || "Unknown",
          }
        }));
        
        setBids(formattedBids);
      } catch (err: any) {
        console.error("Error fetching admin bids:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
  }, []);

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
                <TableCell>{bid.user.email}</TableCell>
                <TableCell>{bid.tender.bid_number}</TableCell>
                <TableCell>₹{bid.bid_amount.toLocaleString()}</TableCell>
                <TableCell>{bid.tender.ministry}</TableCell>
                <TableCell>{bid.tender.department}</TableCell>
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
