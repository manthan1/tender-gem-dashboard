
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

const AdminPage = () => {
  const [bids, setBids] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch all bids with tender and user information
      const { data: bidsData, error: bidsError } = await supabase
        .from('user_bids')
        .select(`*, tender:tender_id(bid_number, category, ministry, department)`)
        .order('created_at', { ascending: false });

      if (bidsError) throw bidsError;
      setBids(bidsData || []);

      // Fetch all documents
      const { data: docsData, error: docsError } = await supabase
        .from('user_documents')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (docsError) throw docsError;
      setDocuments(docsData || []);

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
                          <TableHead className="font-medium">User ID</TableHead>
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
                          <TableHead className="font-medium">User ID</TableHead>
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
                              <TableCell className="font-mono text-xs">{bid.user_id}</TableCell>
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
                          <TableHead className="font-medium">User ID</TableHead>
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
                          <TableHead className="font-medium">User ID</TableHead>
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
                              <TableCell className="font-mono text-xs">{doc.user_id}</TableCell>
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
