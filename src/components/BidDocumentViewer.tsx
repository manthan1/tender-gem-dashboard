
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { File, ArrowLeft, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface BidDocument {
  id: string;
  doc_name: string;
  doc_url: string;
  page_number: number | null;
  created_at: string;
}

interface TenderDetails {
  bid_number: string;
  category: string;
  ministry: string;
  department: string;
}

const BidDocumentViewer = () => {
  const { bidId } = useParams<{ bidId: string }>();
  const [documents, setDocuments] = useState<BidDocument[]>([]);
  const [tenderDetails, setTenderDetails] = useState<TenderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!bidId) return;
      
      try {
        setLoading(true);
        
        // Fetch tender details
        const { data: tenderData, error: tenderError } = await supabase
          .from("tenders_gem")
          .select("bid_number, category, ministry, department")
          .eq("id", bidId)
          .single();
        
        if (tenderError) {
          throw new Error(`Error fetching tender details: ${tenderError.message}`);
        }
        
        // Fetch associated documents
        const { data: docsData, error: docsError } = await supabase
          .from("tender_documents")
          .select("*")
          .eq("bid_id", bidId)
          .order("page_number", { ascending: true });
        
        if (docsError) {
          throw new Error(`Error fetching documents: ${docsError.message}`);
        }
        
        setTenderDetails(tenderData);
        setDocuments(docsData || []);
        
      } catch (err: any) {
        console.error("Error fetching document data:", err);
        setError(err.message);
        toast({
          title: "Error fetching documents",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocuments();
  }, [bidId, toast]);
  
  // Group documents by type/name patterns
  const groupedDocuments = React.useMemo(() => {
    if (!documents.length) return null;
    
    const groups: Record<string, BidDocument[]> = {
      "Specifications": [],
      "Terms & Conditions": [],
      "Certificates": [],
      "Other": []
    };
    
    documents.forEach(doc => {
      const name = doc.doc_name?.toLowerCase() || "";
      if (name.includes("spec") || name.includes("technical") || name.includes("requirement")) {
        groups["Specifications"].push(doc);
      } else if (name.includes("term") || name.includes("condition") || name.includes("agreement")) {
        groups["Terms & Conditions"].push(doc);
      } else if (name.includes("certificate") || name.includes("approval") || name.includes("compliance")) {
        groups["Certificates"].push(doc);
      } else {
        groups["Other"].push(doc);
      }
    });
    
    // Remove empty groups
    Object.keys(groups).forEach(key => {
      if (groups[key].length === 0) {
        delete groups[key];
      }
    });
    
    return groups;
  }, [documents]);

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <Link to="/dashboard" className="flex items-center text-sm text-blue-600 hover:text-blue-800">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to all tenders
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-xl">
                Bid Documents
              </CardTitle>
              <CardDescription>
                {loading ? (
                  <Skeleton className="h-4 w-48" />
                ) : (
                  <>
                    {tenderDetails ? (
                      <span>
                        For tender: {tenderDetails.bid_number}
                      </span>
                    ) : (
                      <span className="text-red-600">Tender not found</span>
                    )}
                  </>
                )}
              </CardDescription>
            </div>
            
            {tenderDetails && (
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{tenderDetails.category}</Badge>
                <Badge variant="secondary">{tenderDetails.ministry}</Badge>
                <Badge variant="secondary">{tenderDetails.department}</Badge>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <Skeleton className="h-9 w-28" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded text-red-800">
              {error}
            </div>
          ) : documents.length === 0 ? (
            <div className="bg-gray-50 p-4 rounded text-gray-500 text-center">
              <FileText className="h-10 w-10 mx-auto mb-2 text-gray-400" />
              <p>No documents available for this tender.</p>
            </div>
          ) : groupedDocuments ? (
            <div className="space-y-6">
              {Object.entries(groupedDocuments).map(([group, docs]) => (
                <div key={group}>
                  <h3 className="mb-2 font-medium">{group}</h3>
                  <div className="space-y-2">
                    {docs.map((doc) => (
                      <div 
                        key={doc.id} 
                        className="flex items-center justify-between p-3 border rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <File className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium">{doc.doc_name}</p>
                            {doc.page_number && (
                              <p className="text-sm text-gray-500">Page {doc.page_number}</p>
                            )}
                          </div>
                        </div>
                        <a 
                          href={doc.doc_url}
                          target="_blank"
                          rel="noopener noreferrer" 
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                        >
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <Download className="h-4 w-4" />
                            Download
                          </Button>
                        </a>
                      </div>
                    ))}
                  </div>
                  <Separator className="mt-4" />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded text-gray-500 text-center">
              <FileText className="h-10 w-10 mx-auto mb-2 text-gray-400" />
              <p>No documents available for this tender.</p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-end">
          <Link to="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default BidDocumentViewer;
