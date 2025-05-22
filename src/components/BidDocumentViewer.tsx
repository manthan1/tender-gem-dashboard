
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  FileText, 
  ArrowLeft, 
  Download, 
  File, 
  ExternalLink 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface TenderDocument {
  id: string;
  bid_id: number;
  doc_name: string;
  doc_url: string;
  page_number: number | null;
}

const BidDocumentViewer = () => {
  const { bidId } = useParams<{ bidId: string }>();
  const [documents, setDocuments] = useState<TenderDocument[]>([]);
  const [bidDetails, setBidDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch documents and bid details
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!bidId) return;
      
      setLoading(true);
      try {
        // Fetch bid details
        const { data: bidData, error: bidError } = await supabase
          .from("tenders_gem")
          .select("*")
          .eq("bid_id", bidId)
          .single();

        if (bidError) throw bidError;
        setBidDetails(bidData);

        // Fetch associated documents
        const { data, error } = await supabase
          .from("tender_documents")
          .select("*")
          .eq("bid_id", bidId)
          .order("page_number", { ascending: true });

        if (error) throw error;
        setDocuments(data || []);
      } catch (error: any) {
        console.error("Error fetching documents:", error);
        toast({
          title: "Error fetching documents",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [bidId, toast]);

  const handleDownload = (url: string) => {
    window.open(url, "_blank");
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Group documents by type based on keywords in name
  const groupedDocuments = documents.reduce((groups: Record<string, TenderDocument[]>, doc) => {
    let type = "Other";
    
    if (doc.doc_name.toLowerCase().includes("spec")) {
      type = "Specifications";
    } else if (doc.doc_name.toLowerCase().includes("term")) {
      type = "Terms & Conditions";
    } else if (doc.doc_name.toLowerCase().includes("warranty")) {
      type = "Warranty Information";
    } else if (doc.doc_name.toLowerCase().includes("certificate")) {
      type = "Certificates";
    }
    
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(doc);
    return groups;
  }, {});

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="mb-6 flex items-center">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleBack} 
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tenders
        </Button>
        <h1 className="text-2xl font-bold flex items-center">
          <FileText className="mr-2 h-6 w-6" />
          Bid Documents
        </h1>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Bid Details</CardTitle>
            </CardHeader>
            <CardContent>
              {bidDetails ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Bid Number</p>
                    <p className="font-medium">{bidDetails.bid_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium">{bidDetails.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ministry</p>
                    <p className="font-medium">{bidDetails.ministry}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Department</p>
                    <p className="font-medium">{bidDetails.department}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No bid details available</p>
              )}
            </CardContent>
          </Card>
          
          {documents.length > 0 ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Associated Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(groupedDocuments).map(([groupName, docs]) => (
                  <div key={groupName}>
                    <h3 className="text-md font-medium mb-3">{groupName}</h3>
                    <div className="space-y-2">
                      {docs.map((doc) => (
                        <div 
                          key={doc.id} 
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-md hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center">
                            <File className="h-5 w-5 mr-3 text-blue-500" />
                            <div>
                              <p className="font-medium">{doc.doc_name}</p>
                              {doc.page_number && (
                                <p className="text-sm text-muted-foreground">Page {doc.page_number}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDownload(doc.doc_url)}
                              className="flex gap-1"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Open
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDownload(doc.doc_url)}
                              className="flex gap-1"
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Separator className="my-4" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 flex flex-col items-center justify-center text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No documents available</h3>
                <p className="text-muted-foreground">
                  There are no documents associated with this bid.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default BidDocumentViewer;
