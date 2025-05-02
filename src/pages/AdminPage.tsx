
import React, { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { Download, Check, Filter, ChevronUp, ChevronDown, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Type definitions
interface Profile {
  id: string;
  full_name: string;
  username: string | null;
  created_at: string;
}

interface UserBid {
  id: string;
  user_id: string;
  tender_id: number; 
  bid_amount: number;
  notes: string;
  created_at: string;
  tender: {
    bid_number: string;
    category: string;
    ministry: string;
  };
  profile?: Profile;
}

interface Tender {
  id: number;
  bid_number: string | null;
  category: string | null;
  ministry: string | null;
  department: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string | null;
  bid_url: string | null;
}

interface UserDocument {
  id: string;
  user_id: string;
  document_type: "aadhar" | "pan" | "driving_license";
  file_path: string;
  verified: boolean | null;
  uploaded_at: string;
  profile?: Profile;
  file_name: string;
}

interface GroupedDocuments {
  [userId: string]: {
    userName: string;
    documents: {
      aadhar?: UserDocument;
      pan?: UserDocument;
      driving_license?: UserDocument;
    };
  };
}

// Filter and pagination constants
const ROWS_PER_PAGE = 20;

const AdminPage: React.FC = () => {
  // State management
  const [bids, setBids] = useState<UserBid[]>([]);
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [verifyingDoc, setVerifyingDoc] = useState<string | null>(null);
  const [downloadingDoc, setDownloadingDoc] = useState<string | null>(null);
  
  // Filtering state
  const [bidUserFilter, setBidUserFilter] = useState<string>("");
  const [bidTenderFilter, setBidTenderFilter] = useState<string>("");
  const [docUserFilter, setDocUserFilter] = useState<string>("");
  const [docVerifiedFilter, setDocVerifiedFilter] = useState<string>("all");

  // Sorting state
  const [bidSortColumn, setBidSortColumn] = useState<string>("created_at");
  const [bidSortDirection, setBidSortDirection] = useState<string>("desc");
  const [tenderSortColumn, setTenderSortColumn] = useState<string>("created_at");
  const [tenderSortDirection, setTenderSortDirection] = useState<string>("desc");

  // Pagination state
  const [bidCurrentPage, setBidCurrentPage] = useState<number>(0);
  const [docCurrentPage, setDocCurrentPage] = useState<number>(0);
  const [tenderCurrentPage, setTenderCurrentPage] = useState<number>(0);
  const [profilesCurrentPage, setProfilesCurrentPage] = useState<number>(0);

  // Selected user for user-specific bids modal
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserBids, setSelectedUserBids] = useState<UserBid[]>([]);
  const [userBidsLoading, setUserBidsLoading] = useState<boolean>(false);
  
  const { toast } = useToast();

  // Group documents by user
  const groupedDocuments = useMemo(() => {
    const grouped: GroupedDocuments = {};

    documents.forEach((doc) => {
      if (!grouped[doc.user_id]) {
        grouped[doc.user_id] = {
          userName: doc.profile?.full_name || "Unknown User",
          documents: {},
        };
      }

      grouped[doc.user_id].documents[doc.document_type] = doc;
    });

    return grouped;
  }, [documents]);

  // Filtered bids
  const filteredBids = useMemo(() => {
    return bids.filter(bid => {
      const userName = bid.profile?.full_name?.toLowerCase() || "";
      const tenderNumber = bid.tender?.bid_number?.toLowerCase() || "";
      
      const matchesUserName = bidUserFilter ? userName.includes(bidUserFilter.toLowerCase()) : true;
      const matchesTender = bidTenderFilter ? tenderNumber.includes(bidTenderFilter.toLowerCase()) : true;
      
      return matchesUserName && matchesTender;
    });
  }, [bids, bidUserFilter, bidTenderFilter]);

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    const filteredDocs = documents.filter(doc => {
      const userName = doc.profile?.full_name?.toLowerCase() || "";
      const matchesUserName = docUserFilter ? userName.includes(docUserFilter.toLowerCase()) : true;
      
      let matchesVerified = true;
      if (docVerifiedFilter === "verified") {
        matchesVerified = doc.verified === true;
      } else if (docVerifiedFilter === "pending") {
        matchesVerified = doc.verified === false || doc.verified === null;
      }
      
      return matchesUserName && matchesVerified;
    });
    
    return filteredDocs;
  }, [documents, docUserFilter, docVerifiedFilter]);

  // Paginated bids
  const paginatedBids = useMemo(() => {
    const startIndex = bidCurrentPage * ROWS_PER_PAGE;
    const endIndex = startIndex + ROWS_PER_PAGE;
    return filteredBids.slice(startIndex, endIndex);
  }, [filteredBids, bidCurrentPage]);

  // Paginated documents for grouping
  const paginatedDocumentIds = useMemo(() => {
    const startIndex = docCurrentPage * ROWS_PER_PAGE;
    const endIndex = startIndex + ROWS_PER_PAGE;
    return filteredDocuments
      .slice(startIndex, endIndex)
      .map(doc => doc.user_id)
      .filter((value, index, self) => self.indexOf(value) === index);
  }, [filteredDocuments, docCurrentPage]);

  // Paginated tenders
  const paginatedTenders = useMemo(() => {
    const startIndex = tenderCurrentPage * ROWS_PER_PAGE;
    const endIndex = startIndex + ROWS_PER_PAGE;
    return tenders.slice(startIndex, endIndex);
  }, [tenders, tenderCurrentPage]);

  // Paginated profiles
  const paginatedProfiles = useMemo(() => {
    const startIndex = profilesCurrentPage * ROWS_PER_PAGE;
    const endIndex = startIndex + ROWS_PER_PAGE;
    return allProfiles.slice(startIndex, endIndex);
  }, [allProfiles, profilesCurrentPage]);

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Fetch user-specific bids when a user is selected
  useEffect(() => {
    if (selectedUserId) {
      fetchUserBids(selectedUserId);
    }
  }, [selectedUserId]);

  const fetchAllData = async () => {
    setLoading(true);

    try {
      // Fetch user profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, username, created_at");

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        toast({
          variant: "destructive",
          title: "Error Fetching Profiles",
          description: profilesError.message || "Could not fetch profiles",
        });
        throw new Error("Could not fetch profiles");
      }

      // Create a map of user IDs to profile objects
      const profilesMap: Record<string, Profile> = {};
      if (profilesData) {
        profilesData.forEach((profile: Profile) => {
          profilesMap[profile.id] = profile;
        });
        setAllProfiles(profilesData);
      }
      setProfiles(profilesMap);

      // Fetch tenders
      const { data: tendersData, error: tendersError } = await supabase
        .from("tenders_gem")
        .select("*");

      if (tendersError) {
        console.error("Error fetching tenders:", tendersError);
        toast({
          variant: "destructive",
          title: "Error Fetching Tenders",
          description: tendersError.message || "Could not fetch tenders",
        });
        throw new Error("Could not fetch tenders");
      }
      
      setTenders(tendersData || []);

      // Fetch user bids with tender information
      const { data: bidsData, error: bidsError } = await supabase
        .from("user_bids")
        .select(
          "id, user_id, tender_id, bid_amount, notes, created_at, tender:tenders_gem(bid_number, category, ministry)"
        )
        .order(bidSortColumn, { ascending: bidSortDirection === "asc" });

      if (bidsError) {
        console.error("Error fetching bids:", bidsError);
        toast({
          variant: "destructive",
          title: "Error Fetching Bids",
          description: bidsError.message || "Could not fetch bids",
        });
        throw new Error("Could not fetch bids");
      }

      // Add profile information to bids
      const bidsWithProfiles = bidsData ? bidsData.map((bid: any) => ({
        ...bid,
        profile: profilesMap[bid.user_id],
      })) : [];
      
      setBids(bidsWithProfiles);

      // Fetch user documents
      const { data: docsData, error: docsError } = await supabase
        .from("user_documents")
        .select("*");

      if (docsError) {
        console.error("Error fetching documents:", docsError);
        toast({
          variant: "destructive",
          title: "Error Fetching Documents",
          description: docsError.message || "Could not fetch documents",
        });
        throw new Error("Could not fetch documents");
      }

      // Add profile information to documents
      const docsWithProfiles = docsData ? docsData.map((doc: any) => ({
        ...doc,
        profile: profilesMap[doc.user_id],
      })) : [];
      
      setDocuments(docsWithProfiles);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast({
        variant: "destructive",
        title: "Error Fetching Data",
        description: error.message || "Failed to load admin dashboard data.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch bids for a specific user
  const fetchUserBids = async (userId: string) => {
    setUserBidsLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_bids")
        .select(
          "id, user_id, tender_id, bid_amount, notes, created_at, tender:tenders_gem(bid_number, category, ministry)"
        )
        .eq("user_id", userId);

      if (error) throw error;

      const userBidsWithProfiles = data ? data.map((bid: any) => ({
        ...bid,
        profile: profiles[bid.user_id],
      })) : [];

      setSelectedUserBids(userBidsWithProfiles);
    } catch (error: any) {
      console.error("Error fetching user bids:", error);
      toast({
        variant: "destructive",
        title: "Error Fetching User Bids",
        description: error.message || "Could not fetch user bids",
      });
    } finally {
      setUserBidsLoading(false);
    }
  };

  // Handle bid sorting
  const handleBidSort = (column: string) => {
    const newDirection = bidSortColumn === column && bidSortDirection === "asc" ? "desc" : "asc";
    setBidSortColumn(column);
    setBidSortDirection(newDirection);
    
    // Sort the bids based on the selected column and direction
    const sortedBids = [...bids].sort((a, b) => {
      if (column === "user") {
        const nameA = a.profile?.full_name?.toLowerCase() || "";
        const nameB = b.profile?.full_name?.toLowerCase() || "";
        return newDirection === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      } else if (column === "tender") {
        const bidNumberA = a.tender?.bid_number?.toLowerCase() || "";
        const bidNumberB = b.tender?.bid_number?.toLowerCase() || "";
        return newDirection === "asc" ? bidNumberA.localeCompare(bidNumberB) : bidNumberB.localeCompare(bidNumberA);
      } else if (column === "bid_amount") {
        return newDirection === "asc" ? a.bid_amount - b.bid_amount : b.bid_amount - a.bid_amount;
      } else if (column === "created_at") {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return newDirection === "asc" ? dateA - dateB : dateB - dateA;
      }
      return 0;
    });
    
    setBids(sortedBids);
  };

  // Handle tender sorting
  const handleTenderSort = (column: string) => {
    const newDirection = tenderSortColumn === column && tenderSortDirection === "asc" ? "desc" : "asc";
    setTenderSortColumn(column);
    setTenderSortDirection(newDirection);
    
    // Sort the tenders based on the selected column and direction
    const sortedTenders = [...tenders].sort((a, b) => {
      if (column === "bid_number") {
        const bidNumberA = a.bid_number?.toLowerCase() || "";
        const bidNumberB = b.bid_number?.toLowerCase() || "";
        return newDirection === "asc" ? bidNumberA.localeCompare(bidNumberB) : bidNumberB.localeCompare(bidNumberA);
      } else if (column === "category") {
        const categoryA = a.category?.toLowerCase() || "";
        const categoryB = b.category?.toLowerCase() || "";
        return newDirection === "asc" ? categoryA.localeCompare(categoryB) : categoryB.localeCompare(categoryA);
      } else if (column === "ministry") {
        const ministryA = a.ministry?.toLowerCase() || "";
        const ministryB = b.ministry?.toLowerCase() || "";
        return newDirection === "asc" ? ministryA.localeCompare(ministryB) : ministryB.localeCompare(ministryA);
      } else if (column === "start_date" || column === "end_date") {
        const dateA = a[column] ? new Date(a[column]!).getTime() : 0;
        const dateB = b[column] ? new Date(b[column]!).getTime() : 0;
        return newDirection === "asc" ? dateA - dateB : dateB - dateA;
      }
      return 0;
    });
    
    setTenders(sortedTenders);
  };

  const downloadDocument = async (userDoc: UserDocument) => {
    try {
      setDownloadingDoc(userDoc.id);
      console.log("Downloading document:", userDoc.file_path);
      
      // Check if file exists first
      const { data: fileExists, error: fileCheckError } = await supabase.storage
        .from("user_documents")
        .list(userDoc.file_path.split('/').slice(0, -1).join('/'));
        
      if (fileCheckError) {
        console.error("Error checking file:", fileCheckError);
        throw new Error("Could not verify file existence");
      }
      
      const fileName = userDoc.file_path.split('/').pop();
      const fileDoesExist = fileExists?.some(file => file.name === fileName);
      
      if (!fileDoesExist) {
        console.error("File doesn't exist in storage:", userDoc.file_path);
        
        // Create mock file for demonstration
        const mockText = `This is a mock document for ${userDoc.document_type}`;
        const mockBlob = new Blob([mockText], { type: 'text/plain' });
        
        // Create a download link
        const url = URL.createObjectURL(mockBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = userDoc.file_name || `${userDoc.document_type}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Demo Download",
          description: "Downloaded a mock document (original not found in storage).",
        });
        
        return;
      }

      // If file exists, proceed with download
      const { data, error } = await supabase.storage
        .from("user_documents")
        .download(userDoc.file_path);

      if (error) throw error;

      // Create a blob URL and trigger download
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = userDoc.file_name || userDoc.file_path.split("/").pop() || "document";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Document Downloaded",
        description: "The document has been downloaded successfully.",
      });
    } catch (error: any) {
      console.error("Error downloading document:", error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Could not download the document. Please try again.",
      });
    } finally {
      setDownloadingDoc(null);
    }
  };

  const verifyDocument = async (docId: string) => {
    setVerifyingDoc(docId);

    try {
      console.log(`Attempting to verify document with ID: ${docId}`);
      
      // Update the document in the database
      const { data, error } = await supabase
        .from("user_documents")
        .update({ verified: true })
        .eq("id", docId)
        .select();

      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }

      console.log("Verification response:", data);

      // Update the local state to reflect the change immediately
      setDocuments(prevDocs => 
        prevDocs.map(doc => 
          doc.id === docId ? { ...doc, verified: true } : doc
        )
      );

      toast({
        title: "Document Verified",
        description: "The document has been marked as verified.",
      });
    } catch (error: any) {
      console.error("Error verifying document:", error);
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: error.message || "Could not verify the document. Please try again.",
      });
    } finally {
      setVerifyingDoc(null);
    }
  };

  // Generate pagination components
  const renderPagination = (
    currentPage: number, 
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>, 
    totalItems: number
  ) => {
    const totalPages = Math.ceil(totalItems / ROWS_PER_PAGE);
    
    if (totalPages <= 1) return null;
    
    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              className={currentPage === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          
          {[...Array(Math.min(5, totalPages))].map((_, i) => {
            // Show pages around current page
            let pageToShow;
            if (totalPages <= 5) {
              pageToShow = i;
            } else if (currentPage < 3) {
              pageToShow = i;
            } else if (currentPage > totalPages - 3) {
              pageToShow = totalPages - 5 + i;
            } else {
              pageToShow = currentPage - 2 + i;
            }
            
            if (pageToShow >= 0 && pageToShow < totalPages) {
              return (
                <PaginationItem key={pageToShow}>
                  <PaginationLink
                    isActive={pageToShow === currentPage}
                    onClick={() => setCurrentPage(pageToShow)}
                  >
                    {pageToShow + 1}
                  </PaginationLink>
                </PaginationItem>
              );
            }
            return null;
          })}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              className={currentPage >= totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  // Render sorting indicators
  const renderSortIndicator = (currentSortColumn: string, column: string, currentDirection: string) => {
    if (currentSortColumn !== column) return null;
    
    return currentDirection === "asc" ? 
      <ChevronUp className="inline h-4 w-4 ml-1" /> : 
      <ChevronDown className="inline h-4 w-4 ml-1" />;
  };

  // Handle clicking on a user in the Users tab
  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId);
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-6">
      <header className="bg-white shadow mb-6">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <Tabs defaultValue="bids" className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-4">
            <TabsTrigger value="bids">All Bids</TabsTrigger>
            <TabsTrigger value="documents">All Documents</TabsTrigger>
            <TabsTrigger value="tenders">All Tenders</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
          </TabsList>

          {/* Bids Tab */}
          <TabsContent value="bids">
            <Card>
              <CardHeader>
                <CardTitle>All User Bids</CardTitle>
                <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 mt-2">
                  <div className="flex-1">
                    <label htmlFor="bid-user-filter" className="text-sm font-medium">
                      Filter by User
                    </label>
                    <Input
                      id="bid-user-filter"
                      placeholder="Search by user name"
                      value={bidUserFilter}
                      onChange={(e) => setBidUserFilter(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="bid-tender-filter" className="text-sm font-medium">
                      Filter by Tender
                    </label>
                    <Input
                      id="bid-tender-filter"
                      placeholder="Search by tender number"
                      value={bidTenderFilter}
                      onChange={(e) => setBidTenderFilter(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[25%]">User</TableHead>
                          <TableHead className="w-[30%]">Tender</TableHead>
                          <TableHead className="w-[15%]">Bid Amount</TableHead>
                          <TableHead className="w-[15%]">Created</TableHead>
                          <TableHead className="w-[15%]">Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.from({ length: 5 }).map((_, index) => (
                          <TableRow key={index}>
                            <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead 
                            className="w-[25%] cursor-pointer"
                            onClick={() => handleBidSort("user")}
                          >
                            User {renderSortIndicator(bidSortColumn, "user", bidSortDirection)}
                          </TableHead>
                          <TableHead 
                            className="w-[30%] cursor-pointer"
                            onClick={() => handleBidSort("tender")}
                          >
                            Tender {renderSortIndicator(bidSortColumn, "tender", bidSortDirection)}
                          </TableHead>
                          <TableHead 
                            className="w-[15%] cursor-pointer"
                            onClick={() => handleBidSort("bid_amount")}
                          >
                            Bid Amount {renderSortIndicator(bidSortColumn, "bid_amount", bidSortDirection)}
                          </TableHead>
                          <TableHead 
                            className="w-[15%] cursor-pointer"
                            onClick={() => handleBidSort("created_at")}
                          >
                            Created {renderSortIndicator(bidSortColumn, "created_at", bidSortDirection)}
                          </TableHead>
                          <TableHead className="w-[15%]">Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBids.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                              No bids found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedBids.map((bid) => (
                            <TableRow key={bid.id}>
                              <TableCell className="align-top">
                                <div>{bid.profile?.full_name || "Unknown User"}</div>
                                <div className="text-xs text-gray-500 font-mono break-all">
                                  {bid.user_id}
                                </div>
                              </TableCell>
                              <TableCell className="align-top">
                                <div>
                                  {bid.tender?.bid_number || `Tender #${bid.tender_id}`}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {bid.tender?.category} / {bid.tender?.ministry}
                                </div>
                              </TableCell>
                              <TableCell className="align-top">
                                ₹{bid.bid_amount.toLocaleString()}
                              </TableCell>
                              <TableCell className="align-top">
                                {format(new Date(bid.created_at), "dd MMM yy")}
                              </TableCell>
                              <TableCell className="align-top text-sm text-muted-foreground">
                                {bid.notes || "-"}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
                {renderPagination(bidCurrentPage, setBidCurrentPage, filteredBids.length)}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>User Documents</CardTitle>
                <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 mt-2">
                  <div className="flex-1">
                    <label htmlFor="doc-user-filter" className="text-sm font-medium">
                      Filter by User
                    </label>
                    <Input
                      id="doc-user-filter"
                      placeholder="Search by user name"
                      value={docUserFilter}
                      onChange={(e) => setDocUserFilter(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="doc-verified-filter" className="text-sm font-medium">
                      Filter by Status
                    </label>
                    <Select
                      value={docVerifiedFilter}
                      onValueChange={setDocVerifiedFilter}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[25%]">User</TableHead>
                          <TableHead className="w-[25%]">Aadhar</TableHead>
                          <TableHead className="w-[25%]">PAN</TableHead>
                          <TableHead className="w-[25%]">Driving License</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.from({ length: 5 }).map((_, index) => (
                          <TableRow key={index}>
                            <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[25%]">User</TableHead>
                          <TableHead className="w-[25%]">Aadhar</TableHead>
                          <TableHead className="w-[25%]">PAN</TableHead>
                          <TableHead className="w-[25%]">Driving License</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(groupedDocuments).length === 0 || paginatedDocumentIds.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                              No documents found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedDocumentIds.map(userId => {
                            const userData = groupedDocuments[userId];
                            if (!userData) return null;
                            
                            return (
                              <TableRow key={userId}>
                                <TableCell className="align-top">
                                  <div>{userData.userName}</div>
                                  <div className="text-xs text-gray-500 font-mono break-all">
                                    {userId}
                                  </div>
                                </TableCell>
                                <TableCell className="align-top">
                                  {userData.documents.aadhar ? (
                                    <div className="flex flex-col gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-1 w-fit"
                                        onClick={() => downloadDocument(userData.documents.aadhar!)}
                                        disabled={downloadingDoc === userData.documents.aadhar.id}
                                      >
                                        <Download className="h-3 w-3" />
                                        {downloadingDoc === userData.documents.aadhar.id ? "Downloading..." : "Aadhar"}
                                      </Button>
                                      
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              variant={userData.documents.aadhar.verified ? "outline" : "default"}
                                              size="sm"
                                              className={`flex items-center gap-1 w-fit ${
                                                userData.documents.aadhar.verified ? "bg-green-100 text-green-800 border-green-300 hover:bg-green-200" : ""
                                              }`}
                                              onClick={() => {
                                                if (!userData.documents.aadhar.verified) {
                                                  verifyDocument(userData.documents.aadhar.id);
                                                }
                                              }}
                                              disabled={verifyingDoc === userData.documents.aadhar.id || userData.documents.aadhar.verified}
                                            >
                                              <Check className="h-3 w-3" />
                                              {verifyingDoc === userData.documents.aadhar.id
                                                ? "Verifying..."
                                                : userData.documents.aadhar.verified
                                                ? "Verified"
                                                : "Verify"}
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            {userData.documents.aadhar.verified 
                                              ? "This document has been verified" 
                                              : "Click to verify this document"}
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">No document</span>
                                  )}
                                </TableCell>
                                <TableCell className="align-top">
                                  {userData.documents.pan ? (
                                    <div className="flex flex-col gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-1 w-fit"
                                        onClick={() => downloadDocument(userData.documents.pan!)}
                                        disabled={downloadingDoc === userData.documents.pan.id}
                                      >
                                        <Download className="h-3 w-3" />
                                        {downloadingDoc === userData.documents.pan.id ? "Downloading..." : "PAN"}
                                      </Button>
                                      
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              variant={userData.documents.pan.verified ? "outline" : "default"}
                                              size="sm"
                                              className={`flex items-center gap-1 w-fit ${
                                                userData.documents.pan.verified ? "bg-green-100 text-green-800 border-green-300 hover:bg-green-200" : ""
                                              }`}
                                              onClick={() => {
                                                if (!userData.documents.pan.verified) {
                                                  verifyDocument(userData.documents.pan.id);
                                                }
                                              }}
                                              disabled={verifyingDoc === userData.documents.pan.id || userData.documents.pan.verified}
                                            >
                                              <Check className="h-3 w-3" />
                                              {verifyingDoc === userData.documents.pan.id
                                                ? "Verifying..."
                                                : userData.documents.pan.verified
                                                ? "Verified"
                                                : "Verify"}
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            {userData.documents.pan.verified 
                                              ? "This document has been verified" 
                                              : "Click to verify this document"}
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">No document</span>
                                  )}
                                </TableCell>
                                <TableCell className="align-top">
                                  {userData.documents.driving_license ? (
                                    <div className="flex flex-col gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-1 w-fit"
                                        onClick={() => downloadDocument(userData.documents.driving_license!)}
                                        disabled={downloadingDoc === userData.documents.driving_license.id}
                                      >
                                        <Download className="h-3 w-3" />
                                        {downloadingDoc === userData.documents.driving_license.id ? "Downloading..." : "License"}
                                      </Button>
                                      
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              variant={userData.documents.driving_license.verified ? "outline" : "default"}
                                              size="sm"
                                              className={`flex items-center gap-1 w-fit ${
                                                userData.documents.driving_license.verified ? "bg-green-100 text-green-800 border-green-300 hover:bg-green-200" : ""
                                              }`}
                                              onClick={() => {
                                                if (!userData.documents.driving_license.verified) {
                                                  verifyDocument(userData.documents.driving_license.id);
                                                }
                                              }}
                                              disabled={verifyingDoc === userData.documents.driving_license.id || userData.documents.driving_license.verified}
                                            >
                                              <Check className="h-3 w-3" />
                                              {verifyingDoc === userData.documents.driving_license.id
                                                ? "Verifying..."
                                                : userData.documents.driving_license.verified
                                                ? "Verified"
                                                : "Verify"}
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            {userData.documents.driving_license.verified 
                                              ? "This document has been verified" 
                                              : "Click to verify this document"}
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">No document</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
                {renderPagination(docCurrentPage, setDocCurrentPage, filteredDocuments.length)}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tenders Tab */}
          <TabsContent value="tenders">
            <Card>
              <CardHeader>
                <CardTitle>All Tenders</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[20%]">Bid Number</TableHead>
                          <TableHead className="w-[20%]">Category</TableHead>
                          <TableHead className="w-[20%]">Ministry</TableHead>
                          <TableHead className="w-[20%]">Start Date</TableHead>
                          <TableHead className="w-[20%]">End Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.from({ length: 5 }).map((_, index) => (
                          <TableRow key={index}>
                            <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead 
                            className="w-[20%] cursor-pointer"
                            onClick={() => handleTenderSort("bid_number")}
                          >
                            Bid Number {renderSortIndicator(tenderSortColumn, "bid_number", tenderSortDirection)}
                          </TableHead>
                          <TableHead 
                            className="w-[20%] cursor-pointer"
                            onClick={() => handleTenderSort("category")}
                          >
                            Category {renderSortIndicator(tenderSortColumn, "category", tenderSortDirection)}
                          </TableHead>
                          <TableHead 
                            className="w-[20%] cursor-pointer"
                            onClick={() => handleTenderSort("ministry")}
                          >
                            Ministry {renderSortIndicator(tenderSortColumn, "ministry", tenderSortDirection)}
                          </TableHead>
                          <TableHead 
                            className="w-[20%] cursor-pointer"
                            onClick={() => handleTenderSort("start_date")}
                          >
                            Start Date {renderSortIndicator(tenderSortColumn, "start_date", tenderSortDirection)}
                          </TableHead>
                          <TableHead 
                            className="w-[20%] cursor-pointer"
                            onClick={() => handleTenderSort("end_date")}
                          >
                            End Date {renderSortIndicator(tenderSortColumn, "end_date", tenderSortDirection)}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedTenders.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                              No tenders found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedTenders.map((tender) => (
                            <TableRow key={tender.id}>
                              <TableCell>{tender.bid_number || "-"}</TableCell>
                              <TableCell>{tender.category || "-"}</TableCell>
                              <TableCell>{tender.ministry || "-"}</TableCell>
                              <TableCell>
                                {tender.start_date ? format(new Date(tender.start_date), "dd MMM yy") : "-"}
                              </TableCell>
                              <TableCell>
                                {tender.end_date ? format(new Date(tender.end_date), "dd MMM yy") : "-"}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
                {renderPagination(tenderCurrentPage, setTenderCurrentPage, tenders.length)}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[40%]">Name</TableHead>
                          <TableHead className="w-[30%]">Username</TableHead>
                          <TableHead className="w-[20%]">Created</TableHead>
                          <TableHead className="w-[10%]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.from({ length: 5 }).map((_, index) => (
                          <TableRow key={index}>
                            <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[40%]">Name</TableHead>
                          <TableHead className="w-[30%]">Username</TableHead>
                          <TableHead className="w-[20%]">Created</TableHead>
                          <TableHead className="w-[10%]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedProfiles.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                              No users found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedProfiles.map((profile) => (
                            <TableRow key={profile.id}>
                              <TableCell className="align-top">
                                <div>{profile.full_name || "Unknown"}</div>
                                <div className="text-xs text-gray-500 font-mono break-all">
                                  {profile.id}
                                </div>
                              </TableCell>
                              <TableCell className="align-top">
                                {profile.username || "-"}
                              </TableCell>
                              <TableCell className="align-top">
                                {format(new Date(profile.created_at), "dd MMM yy")}
                              </TableCell>
                              <TableCell className="align-top">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center gap-1"
                                  onClick={() => handleUserClick(profile.id)}
                                >
                                  <Users className="h-3 w-3" />
                                  Bids
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
                {renderPagination(profilesCurrentPage, setProfilesCurrentPage, allProfiles.length)}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* User Bids Modal */}
      <Dialog open={selectedUserId !== null} onOpenChange={(open) => !open && setSelectedUserId(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              User Bids: {selectedUserId && profiles[selectedUserId]?.full_name}
            </DialogTitle>
            <DialogDescription>
              All bids placed by this user
            </DialogDescription>
          </DialogHeader>
          
          {userBidsLoading ? (
            <div className="p-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Tender</TableHead>
                    <TableHead className="w-[15%]">Bid Amount</TableHead>
                    <TableHead className="w-[15%]">Date</TableHead>
                    <TableHead className="w-[30%]">Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedUserBids.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No bids found for this user.
                      </TableCell>
                    </TableRow>
                  ) : (
                    selectedUserBids.map((bid) => (
                      <TableRow key={bid.id}>
                        <TableCell>
                          <div>{bid.tender?.bid_number || `Tender #${bid.tender_id}`}</div>
                          <div className="text-xs text-gray-500">
                            {bid.tender?.category} / {bid.tender?.ministry}
                          </div>
                        </TableCell>
                        <TableCell>₹{bid.bid_amount.toLocaleString()}</TableCell>
                        <TableCell>{format(new Date(bid.created_at), "dd MMM yy")}</TableCell>
                        <TableCell>{bid.notes || "-"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;
