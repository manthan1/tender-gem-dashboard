
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { GemBid } from "@/hooks/useGemBids";

interface TenderTableProps {
  bids: GemBid[];
  loading: boolean;
}

const TenderTable: React.FC<TenderTableProps> = ({ bids, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading data...</p>
      </div>
    );
  }

  if (bids.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">No tenders found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px] font-medium">Bid Number</TableHead>
            <TableHead className="font-medium">Category</TableHead>
            <TableHead className="font-medium">Quantity</TableHead>
            <TableHead className="font-medium">Ministry</TableHead>
            <TableHead className="font-medium">Department</TableHead>
            <TableHead className="font-medium">Start Date</TableHead>
            <TableHead className="font-medium">End Date</TableHead>
            <TableHead className="font-medium">Download</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bids.map((bid) => (
            <TableRow key={bid.id}>
              <TableCell className="font-medium">{bid.bid_number}</TableCell>
              <TableCell>{bid.category}</TableCell>
              <TableCell>{bid.quantity}</TableCell>
              <TableCell>{bid.ministry}</TableCell>
              <TableCell>{bid.department}</TableCell>
              <TableCell>
                {bid.start_date 
                  ? format(new Date(bid.start_date), "dd MMM yyyy")
                  : "N/A"}
              </TableCell>
              <TableCell>
                {bid.end_date 
                  ? format(new Date(bid.end_date), "dd MMM yyyy")
                  : "N/A"}
              </TableCell>
              <TableCell>
                {bid.download_url ? (
                  <a
                    href={bid.download_url}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download
                  </a>
                ) : (
                  "N/A"
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TenderTable;
