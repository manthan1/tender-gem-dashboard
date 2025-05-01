
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { UserBid } from "@/hooks/useUserBids";

interface UserBidsTableProps {
  bids: UserBid[];
  loading: boolean;
}

const UserBidsTable: React.FC<UserBidsTableProps> = ({ bids, loading }) => {
  // Show loading skeleton
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Bids</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-medium">Tender</TableHead>
                  <TableHead className="font-medium">Category</TableHead>
                  <TableHead className="font-medium">Bid Amount</TableHead>
                  <TableHead className="font-medium">Date</TableHead>
                  <TableHead className="font-medium">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array(3).fill(0).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If no bids, show a message
  if (bids.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Bids</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-32">
            <p className="text-gray-500">You haven't placed any bids yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show the actual bids
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Bids</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-medium">Tender</TableHead>
                <TableHead className="font-medium">Category</TableHead>
                <TableHead className="font-medium">Bid Amount</TableHead>
                <TableHead className="font-medium">Date</TableHead>
                <TableHead className="font-medium">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bids.map((bid) => (
                <TableRow key={bid.id}>
                  <TableCell className="font-medium">{bid.tender?.bid_number || `Tender #${bid.tender_id}`}</TableCell>
                  <TableCell>{bid.tender?.category || "N/A"}</TableCell>
                  <TableCell>₹{bid.bid_amount.toLocaleString()}</TableCell>
                  <TableCell>{format(new Date(bid.created_at), "dd MMM yyyy")}</TableCell>
                  <TableCell>{bid.notes || "No notes"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserBidsTable;
