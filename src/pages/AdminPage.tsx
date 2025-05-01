
import React, { useState, useEffect } from "react";
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
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface Profile {
  full_name: string | null;
  id: string;
}

interface UserBid {
  id: string;
  user_id: string;
  bid_amount: number;
  tender_id: number;
  created_at: string;
  notes: string | null;
  tender?: {
    bid_number: string;
    category: string;
    ministry: string;
    department: string;
  };
  profile?: Profile;
}

interface UserDocument {
  id: string;
  user_id: string;
  document_type: string;
  file_name: string;
  uploaded_at: string;
  verified: boolean;
  profile?: Profile;
}

const AdminPage = () => {
  const [bids, setBids] = useState<UserBid[]>([]);
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch all profiles first to use as a lookup table
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name');

      if (profilesError) throw profilesError;
      
      // Create a lookup map of user_id to profile
      const profilesMap: Record<string, Profile> = {};
      if (profilesData) {
        profilesData.forEach((profile: Profile) => {
          profilesMap[profile.id] = profile;
        });
      }
      setProfiles(profilesMap);

      // Fetch all bids with tender and user information
      const { data: bidsData, error: bidsError } = await supabase
        .from('user_bids')
        .select(`*, tender:tender_id(bid_number, category, ministry, department)`)
        .order('created_at', { ascending: false });

      if (bidsError) throw bidsError;
      
      // Attach profile data to each bid
      const bidsWithProfiles = (bidsData || []).map((bid: UserBid) => ({
        ...bid,
        profile: profilesMap[bid.user_id]
      }));
      
      setBids(bidsWithProfiles);

      // Fetch all documents
      const { data: docsData, error: docsError } = await supabase
        .from('user_documents')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (docsError) throw docsError;
      
      // Attach profile data to each document
      const docsWithProfiles = (docsData || []).map((doc: UserDocument) => ({
        ...doc,
        profile: profilesMap[doc.user_id]
      }));
      
      setDocuments(docsWithProfiles);

    } catch (error: any) {
      console.error("Error fetching admin data:", error);
      toast({
        title: "Error fetching data",
        description: error.message || "Failed to load admin data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (userId: string): string => {
    const profile = profiles[userId];
    return profile?.full_name || userId;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
          <Link to="/dashboard">
            <Button variant="outline" className="flex gap-2 items-center">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Tabs defaultValue="bids" className="px-4 sm:px-0">
          <TabsList>
            <TabsTrigger value="bids">All Bids</TabsTrigger>
            <TabsTrigger value="documents">All Documents</TabsTrigger>
          </TabsList>
          
          {/* Bids Tab */}
          <TabsContent value="bids">
            <Card>
              <CardHeader>
                <CardTitle>All User Bids</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-medium">User</TableHead>
                          <TableHead className="font-medium">Tender</TableHead>
                          <TableHead className="font-medium">Bid Amount</TableHead>
                          <TableHead className="font-medium">Created</TableHead>
                          <TableHead className="font-medium">Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array(5).fill(0).map((_, index) => (
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
                ) : (
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-medium">User</TableHead>
                          <TableHead className="font-medium">Tender</TableHead>
                          <TableHead className="font-medium">Bid Amount</TableHead>
                          <TableHead className="font-medium">Created</TableHead>
                          <TableHead className="font-medium">Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bids.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-4">No bids found</TableCell>
                          </TableRow>
                        ) : (
                          bids.map((bid) => (
                            <TableRow key={bid.id}>
                              <TableCell>
                                {bid.profile?.full_name || "Unknown User"}
                                <div className="text-xs text-gray-500 mt-1 font-mono">
                                  {bid.user_id}
                                </div>
                              </TableCell>
                              <TableCell>
                                {bid.tender?.bid_number || `Tender #${bid.tender_id}`}
                                <div className="text-xs text-gray-500 mt-1">
                                  {bid.tender?.category || "Unknown"} - {bid.tender?.ministry || "Unknown"}
                                </div>
                              </TableCell>
                              <TableCell>₹{bid.bid_amount.toLocaleString()}</TableCell>
                              <TableCell>{format(new Date(bid.created_at), "dd MMM yyyy")}</TableCell>
                              <TableCell>{bid.notes || "No notes"}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>All User Documents</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-medium">User</TableHead>
                          <TableHead className="font-medium">Document Type</TableHead>
                          <TableHead className="font-medium">File Name</TableHead>
                          <TableHead className="font-medium">Uploaded</TableHead>
                          <TableHead className="font-medium">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array(5).fill(0).map((_, index) => (
                          <TableRow key={index}>
                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-medium">User</TableHead>
                          <TableHead className="font-medium">Document Type</TableHead>
                          <TableHead className="font-medium">File Name</TableHead>
                          <TableHead className="font-medium">Uploaded</TableHead>
                          <TableHead className="font-medium">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {documents.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-4">No documents found</TableCell>
                          </TableRow>
                        ) : (
                          documents.map((doc) => (
                            <TableRow key={doc.id}>
                              <TableCell>
                                {doc.profile?.full_name || "Unknown User"}
                                <div className="text-xs text-gray-500 mt-1 font-mono">
                                  {doc.user_id}
                                </div>
                              </TableCell>
                              <TableCell>{doc.document_type}</TableCell>
                              <TableCell>{doc.file_name}</TableCell>
                              <TableCell>
                                {doc.uploaded_at ? format(new Date(doc.uploaded_at), "dd MMM yyyy") : "Unknown"}
                              </TableCell>
                              <TableCell>
                                <Badge variant={doc.verified ? "default" : "outline"}>
                                  {doc.verified ? "Verified" : "Pending"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPage;
