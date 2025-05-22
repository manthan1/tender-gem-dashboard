
import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import PlaceBidModal from "./PlaceBidModal";
import { useUserBids } from "@/hooks/useUserBids";
import { FileText, ExternalLink } from "lucide-react";

interface TenderTableProps {
  bids: GemBid[];
  loading: boolean;
}

const TenderTable: React.FC<TenderTableProps> = ({ bids, loading }) => {
  // Keep local state of bids to prevent flashing when data is loading
  const [displayBids, setDisplayBids] = useState<GemBid[]>(bids);
  const { isAuthenticated } = useAuth();
  const { placeBid, hasBidOnTender } = useUserBids();
  const [selectedTender, setSelectedTender] = useState<GemBid | null>(null);
  const [existingBid, setExistingBid] = useState<ReturnType<typeof hasBidOnTender>>(null);
  const [bidModalOpen, setBidModalOpen] = useState(false);
  const navigate = useNavigate();
  
  // Only update display bids when actual bids change and loading is complete
  useEffect(() => {
    if (!loading && bids.length > 0) {
      setDisplayBids(bids);
    }
  }, [bids, loading]);

  const handleBidClick = useCallback((tender: GemBid) => {
    const userBid = hasBidOnTender(tender.id);
    setSelectedTender(tender);
    setExistingBid(userBid);
    setBidModalOpen(true);
  }, [hasBidOnTender]);

  const handleViewDocuments = useCallback((bidId: number | null) => {
    if (bidId) {
      navigate(`/bid/${bidId}/documents`);
    }
  }, [navigate]);
  
  // Create a reusable table header to avoid duplicating code
  const TableHeaders = React.memo(() => (
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
        <TableHead className="font-medium">Documents</TableHead>
        <TableHead className="font-medium">Actions</TableHead>
      </TableRow>
    </TableHeader>
  ));
  
  // If no data has been loaded yet and we're in a loading state, show skeleton
  if (loading && displayBids.length === 0) {
    return (
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeaders />
          <TableBody>
            {Array(5).fill(0).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  // If we have data but are loading more, show existing data with a loading indicator
  if (loading && displayBids.length > 0) {
    return (
      <div className="rounded-md border overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-100 overflow-hidden">
          <div className="h-full bg-blue-500 animate-pulse" style={{ width: '30%' }}></div>
        </div>
        <Table>
          <TableHeaders />
          <TableBody>
            {displayBids.map((bid) => (
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
                      className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Download
                    </a>
                  ) : (
                    "N/A"
                  )}
                </TableCell>
                <TableCell>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleViewDocuments(bid.bid_id)}
                    className="flex items-center gap-1"
                  >
                    <FileText className="h-4 w-4" />
                    View
                  </Button>
                </TableCell>
                <TableCell>
                  {isAuthenticated && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleBidClick(bid)}
                    >
                      Place Bid
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  // If we have no data to display, show a message
  if (displayBids.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 border rounded-md">
        <p className="text-gray-500">No tenders found matching your criteria.</p>
      </div>
    );
  }

  // Otherwise, show the data
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeaders />
        <TableBody>
          {displayBids.map((bid) => {
            const userHasBid = hasBidOnTender(bid.id);
            return (
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
                      className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Download
                    </a>
                  ) : (
                    "N/A"
                  )}
                </TableCell>
                <TableCell>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleViewDocuments(bid.bid_id)}
                    className="flex items-center gap-1"
                  >
                    <FileText className="h-4 w-4" />
                    View
                  </Button>
                </TableCell>
                <TableCell>
                  {isAuthenticated && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleBidClick(bid)}
                    >
                      {userHasBid ? "Edit Bid" : "Place Bid"}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Bid Modal */}
      <PlaceBidModal 
        isOpen={bidModalOpen}
        onClose={() => setBidModalOpen(false)}
        tender={selectedTender}
        existingBid={existingBid}
        onPlaceBid={placeBid}
      />
    </div>
  );
};

// Use React.memo to prevent unnecessary re-renders
export default React.memo(TenderTable);
