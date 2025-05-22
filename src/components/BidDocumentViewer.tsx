
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, ArrowLeft, Download, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TenderDocument {
  id: string;
  bid_id: number;
  doc_name: string;
  doc_url: string;
  page_number: number | null;
  created_at: string;
}

const BidDocumentViewer: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<TenderDocument[]>([]);
  const [bidDetails, setBidDetails] = useState<{ bid_number: string; category: string } | null>(null);
  const { bidId } = useParams<{ bidId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!bidId) return;
      
      setLoading(true);
      try {
        // Fetch documents for this bid
        const { data: documentData, error: documentError } = await supabase
          .from("tender_documents")
          .select("*")
          .eq("bid_id", parseInt(bidId))
          .order("page_number", { ascending: true });

        if (documentError) {
          throw documentError;
        }

        // Fetch bid details
        const { data: bidData, error: bidError } = await supabase
          .from("tenders_gem")
          .select("bid_number, category")
          .eq("bid_id", parseInt(bidId))
          .single();

        if (bidError) {
          console.error("Error fetching bid details:", bidError);
        } else {
          setBidDetails(bidData);
        }

        setDocuments(documentData || []);
      } catch (err) {
        console.error("Error fetching documents:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [bidId]);

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div className="container py-6 max-w-5xl">
      <div className="mb-6">
        <Button variant="outline" onClick={handleBackClick} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {loading || !bidDetails ? (
                <Skeleton className="h-7 w-64" />
              ) : (
                <span>Bid Documents - {bidDetails.bid_number || "Unknown Bid"}</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 opacity-20 mb-2" />
                <p>No documents found for this bid</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Name</TableHead>
                      <TableHead>Page Number</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.doc_name || "Unnamed Document"}</TableCell>
                        <TableCell>{doc.page_number !== null ? `Page ${doc.page_number}` : "N/A"}</TableCell>
                        <TableCell className="text-right">
                          {doc.doc_url ? (
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                asChild
                              >
                                <a href={doc.doc_url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  View
                                </a>
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                asChild
                              >
                                <a href={doc.doc_url} download>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </a>
                              </Button>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No URL available</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BidDocumentViewer;
