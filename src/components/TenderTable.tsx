import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
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
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import PlaceBidModal from "./PlaceBidModal";
import { useUserBids } from "@/hooks/useUserBids";
import { FileText, Download, MapPin, Building, Calendar } from "lucide-react";

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

  const truncateText = (text: string, maxLength: number = 30) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };
  
  // Create a reusable table header to avoid duplicating code
  const TableHeaders = React.memo(() => (
    <TableHeader>
      <TableRow className="bg-gray-50">
        <TableHead className="w-[140px] font-semibold">Bid Number</TableHead>
        <TableHead className="font-semibold">Category</TableHead>
        <TableHead className="w-[80px] font-semibold">Quantity</TableHead>
        <TableHead className="font-semibold">Ministry</TableHead>
        <TableHead className="font-semibold">Department</TableHead>
        <TableHead className="w-[120px] font-semibold">City</TableHead>
        <TableHead className="w-[110px] font-semibold">Start Date</TableHead>
        <TableHead className="w-[110px] font-semibold">End Date</TableHead>
        <TableHead className="w-[100px] font-semibold">Download</TableHead>
        <TableHead className="w-[100px] font-semibold">Actions</TableHead>
        <TableHead className="w-[120px] font-semibold">Documents</TableHead>
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
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-100 overflow-hidden z-10">
          <div className="h-full bg-blue-500 animate-pulse" style={{ width: '30%' }}></div>
        </div>
        <Table>
          <TableHeaders />
          <TableBody>
            {displayBids.map((bid) => (
              <TableRow key={bid.id} className="hover:bg-gray-50 transition-colors">
                <TableCell className="font-medium">
                  <Badge variant="outline" className="font-mono text-xs">
                    {bid.bid_number}
                  </Badge>
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="text-sm">{truncateText(bid.category, 40)}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{bid.category}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    {bid.quantity}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Building className="h-3 w-3 text-gray-400" />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <span className="text-sm">{truncateText(bid.ministry, 25)}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{bid.ministry}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="text-sm">{truncateText(bid.department, 25)}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{bid.department}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <span className="text-sm font-medium">{truncateText(bid.city, 15)}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{bid.city}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-green-500" />
                    <span className="text-xs">
                      {bid.start_date 
                        ? format(new Date(bid.start_date), "dd MMM yyyy")
                        : "N/A"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-red-500" />
                    <span className="text-xs">
                      {bid.end_date 
                        ? format(new Date(bid.end_date), "dd MMM yyyy")
                        : "N/A"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {bid.download_url ? (
                    <Button size="sm" variant="outline" asChild>
                      <a
                        href={bid.download_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" />
                        <span className="text-xs">PDF</span>
                      </a>
                    </Button>
                  ) : (
                    <span className="text-xs text-gray-400">N/A</span>
                  )}
                </TableCell>
                <TableCell>
                  {isAuthenticated && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleBidClick(bid)}
                      className="text-xs"
                    >
                      Place Bid
                    </Button>
                  )}
                </TableCell>
                <TableCell>
                  {bid.bid_id && (
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                    >
                      <Link to={`/bid/${bid.bid_id}`} className="flex gap-1 items-center">
                        <FileText className="h-3 w-3" />
                        <span className="text-xs">Docs</span>
                      </Link>
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
      <div className="flex flex-col justify-center items-center h-64 border rounded-md bg-gray-50">
        <FileText className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg font-medium">No tenders found</p>
        <p className="text-gray-400 text-sm">Try adjusting your filters or search terms</p>
      </div>
    );
  }

  // Otherwise, show the data
  return (
    <TooltipProvider>
      <div className="rounded-md border overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeaders />
          <TableBody>
            {displayBids.map((bid) => {
              const userHasBid = hasBidOnTender(bid.id);
              return (
                <TableRow key={bid.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="font-medium">
                    <Badge variant="outline" className="font-mono text-xs">
                      {bid.bid_number}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="text-sm">{truncateText(bid.category, 40)}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{bid.category}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {bid.quantity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Building className="h-3 w-3 text-gray-400" />
                      <Tooltip>
                        <TooltipTrigger>
                          <span className="text-sm">{truncateText(bid.ministry, 25)}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{bid.ministry}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="text-sm">{truncateText(bid.department, 25)}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{bid.department}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <Tooltip>
                        <TooltipTrigger>
                          <span className="text-sm font-medium text-blue-600">{truncateText(bid.city, 15)}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{bid.city}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-green-500" />
                      <span className="text-xs">
                        {bid.start_date 
                          ? format(new Date(bid.start_date), "dd MMM yyyy")
                          : "N/A"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-red-500" />
                      <span className="text-xs">
                        {bid.end_date 
                          ? format(new Date(bid.end_date), "dd MMM yyyy")
                          : "N/A"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {bid.download_url ? (
                      <Button size="sm" variant="outline" asChild>
                        <a
                          href={bid.download_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1"
                        >
                          <Download className="h-3 w-3" />
                          <span className="text-xs">PDF</span>
                        </a>
                      </Button>
                    ) : (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {isAuthenticated && (
                      <Button 
                        size="sm" 
                        variant={userHasBid ? "default" : "outline"}
                        onClick={() => handleBidClick(bid)}
                        className="text-xs"
                      >
                        {userHasBid ? "Edit Bid" : "Place Bid"}
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    {bid.bid_id && (
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                      >
                        <Link to={`/bid/${bid.bid_id}`} className="flex gap-1 items-center">
                          <FileText className="h-3 w-3" />
                          <span className="text-xs">Docs</span>
                        </Link>
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
    </TooltipProvider>
  );
};

// Use React.memo to prevent unnecessary re-renders
export default React.memo(TenderTable);
