
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import PlaceBidModal from "./PlaceBidModal";
import { useUserBids } from "@/hooks/useUserBids";
import { FileText, Download, MapPin, Building, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TenderTableProps {
  bids: GemBid[];
  loading: boolean;
}

const TenderTable: React.FC<TenderTableProps> = ({ bids, loading }) => {
  const [displayBids, setDisplayBids] = useState<GemBid[]>(bids);
  const { isAuthenticated } = useAuth();
  const { placeBid, hasBidOnTender } = useUserBids();
  const [selectedTender, setSelectedTender] = useState<GemBid | null>(null);
  const [existingBid, setExistingBid] = useState<ReturnType<typeof hasBidOnTender>>(null);
  const [bidModalOpen, setBidModalOpen] = useState(false);
  
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

  const truncateText = (text: string | null | undefined, maxLength: number = 30) => {
    if (!text || typeof text !== 'string') return "N/A";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Mobile Card Component
  const MobileCard: React.FC<{ bid: GemBid }> = ({ bid }) => {
    const userHasBid = hasBidOnTender(bid.id);
    
    return (
      <div className="p-4 border-b border-gray-100 last:border-b-0 min-h-[80px] touch-manipulation">
        <div className="space-y-3">
          {/* Header Row */}
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <button className="text-navy-500 hover:text-navy-700 font-mono text-xs underline-offset-2 hover:underline transition-colors focus-brand text-left">
                {bid.bid_number || "N/A"}
              </button>
              <p className="text-sm text-gray-800 mt-1 line-clamp-2">
                {bid.category || "N/A"}
              </p>
            </div>
            <div className="ml-3 flex flex-col items-end gap-2">
              <div className="bg-blue-50 text-navy-600 text-xs font-semibold px-2 py-1 rounded-md">
                {bid.quantity || "N/A"}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-1">
              <Building className="h-3 w-3 text-gray-400 flex-shrink-0" />
              <span className="text-gray-800 truncate">{truncateText(bid.ministry, 20)}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
              <span className="text-navy-600 font-medium truncate">{truncateText(bid.city, 15)}</span>
            </div>
          </div>

          {/* Dates Row */}
          <div className="flex justify-between items-center text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Start: {bid.start_date ? format(new Date(bid.start_date), "dd MMM") : "N/A"}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>End: {bid.end_date ? format(new Date(bid.end_date), "dd MMM") : "N/A"}</span>
            </div>
          </div>

          {/* Actions Row */}
          <div className="flex gap-2 pt-2">
            {bid.download_url && (
              <Button size="sm" variant="ghost" asChild className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 h-8 min-h-[44px] flex-1">
                <a
                  href={bid.download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1"
                >
                  <Download className="h-3 w-3" />
                  <span className="text-xs">PDF</span>
                </a>
              </Button>
            )}
            
            {isAuthenticated && (
              <Button 
                size="sm" 
                onClick={() => handleBidClick(bid)}
                className={`text-xs px-3 py-1 rounded-md transition-all duration-200 hover:translate-y-[-1px] hover:shadow-md focus-brand flex-1 min-h-[44px] ${
                  userHasBid 
                    ? "bg-navy-500 hover:bg-navy-600 text-white" 
                    : "bg-orange-500 hover:bg-orange-600 text-white"
                }`}
              >
                {userHasBid ? "Edit Bid" : "Place Bid"}
              </Button>
            )}

            {bid.bid_id && (
              <Button
                size="sm"
                variant="ghost"
                asChild
                className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 h-8 min-h-[44px] flex-1"
              >
                <Link to={`/bid/${bid.bid_id}`} className="flex gap-1 items-center justify-center">
                  <FileText className="h-3 w-3" />
                  <span className="text-xs">Docs</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  const TableHeaders = React.memo(() => (
    <TableHeader>
      <TableRow className="bg-brand-light-gray border-b border-gray-200">
        <TableHead className="w-[140px] font-semibold text-sm brand-navy">Bid Number</TableHead>
        <TableHead className="font-semibold text-sm brand-navy">Category</TableHead>
        <TableHead className="w-[80px] font-semibold text-sm brand-navy">Quantity</TableHead>
        <TableHead className="font-semibold text-sm brand-navy">Ministry</TableHead>
        <TableHead className="font-semibold text-sm brand-navy">Department</TableHead>
        <TableHead className="w-[120px] font-semibold text-sm brand-navy">City</TableHead>
        <TableHead className="w-[110px] font-semibold text-sm brand-navy">Start Date</TableHead>
        <TableHead className="w-[110px] font-semibold text-sm brand-navy">End Date</TableHead>
        <TableHead className="w-[100px] font-semibold text-sm brand-navy">Download</TableHead>
        <TableHead className="w-[100px] font-semibold text-sm brand-navy">Actions</TableHead>
        <TableHead className="w-[120px] font-semibold text-sm brand-navy">Documents</TableHead>
      </TableRow>
    </TableHeader>
  ));
  
  if (loading && displayBids.length === 0) {
    return (
      <div className="rounded-2xl border-0 overflow-hidden bg-white">
        {/* Mobile Loading */}
        <div className="sm:hidden">
          {Array(5).fill(0).map((_, index) => (
            <div key={index} className="p-4 border-b border-gray-100 space-y-3">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-4 w-48 rounded" />
                </div>
                <Skeleton className="h-6 w-12 rounded" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 flex-1 rounded" />
                <Skeleton className="h-8 flex-1 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Loading */}
        <div className="hidden sm:block">
          <Table>
            <TableHeaders />
            <TableBody>
              {Array(5).fill(0).map((_, index) => (
                <TableRow key={index} className="border-b border-gray-100">
                  <TableCell><Skeleton className="h-5 w-32 rounded-lg" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-40 rounded-lg" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16 rounded-lg" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32 rounded-lg" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-40 rounded-lg" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24 rounded-lg" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24 rounded-lg" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24 rounded-lg" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20 rounded-lg" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20 rounded-lg" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20 rounded-lg" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (displayBids.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-64 bg-gray-50 rounded-2xl">
        <FileText className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg font-medium">No tenders found</p>
        <p className="text-gray-400 text-sm">Try adjusting your filters or search terms</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-0 overflow-hidden bg-white">
      {loading && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-100 overflow-hidden z-10">
          <div className="h-full bg-orange-500 animate-pulse" style={{ width: '30%' }}></div>
        </div>
      )}

      {/* Mobile Cards (≤640px) */}
      <div className="sm:hidden">
        {displayBids.map((bid) => (
          <MobileCard key={bid.id} bid={bid} />
        ))}
      </div>

      {/* Desktop Table (≥640px) */}
      <div className="hidden sm:block">
        <Table>
          <TableHeaders />
          <TableBody>
            {displayBids.map((bid) => {
              const userHasBid = hasBidOnTender(bid.id);
              return (
                <TableRow key={bid.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                  <TableCell className="font-medium">
                    <button className="text-navy-500 hover:text-navy-700 font-mono text-xs underline-offset-2 hover:underline transition-colors focus-brand">
                      {bid.bid_number || "N/A"}
                    </button>
                  </TableCell>
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="text-sm text-gray-800">{truncateText(bid.category, 40)}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{bid.category || "N/A"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <div className="bg-blue-50 text-navy-600 text-xs font-semibold px-2 py-1 rounded-md w-fit">
                      {bid.quantity || "N/A"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Building className="h-3 w-3 text-gray-400" />
                      <Tooltip>
                        <TooltipTrigger>
                          <span className="text-sm text-gray-800">{truncateText(bid.ministry, 25)}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{bid.ministry || "N/A"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="text-sm text-gray-800">{truncateText(bid.department, 25)}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{bid.department || "N/A"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <Tooltip>
                        <TooltipTrigger>
                          <span className="text-sm font-medium text-navy-600">{truncateText(bid.city, 15)}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{bid.city || "N/A"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-600">
                          {bid.start_date 
                            ? format(new Date(bid.start_date), "dd MMM")
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-xs text-gray-600">
                          {bid.end_date 
                            ? format(new Date(bid.end_date), "dd MMM")
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {bid.download_url ? (
                      <Button size="sm" variant="ghost" asChild className="text-gray-600 hover:text-gray-800 hover:bg-gray-100">
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
                        onClick={() => handleBidClick(bid)}
                        className={`text-xs px-3 py-1 rounded-md transition-all duration-200 hover:translate-y-[-1px] hover:shadow-md focus-brand ${
                          userHasBid 
                            ? "bg-navy-500 hover:bg-navy-600 text-white" 
                            : "bg-orange-500 hover:bg-orange-600 text-white"
                        }`}
                      >
                        {userHasBid ? "Edit Bid" : "Place Bid"}
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    {bid.bid_id && (
                      <Button
                        size="sm"
                        variant="ghost"
                        asChild
                        className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
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
      </div>

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

export default React.memo(TenderTable);
