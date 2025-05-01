
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Check, X, Loader2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface AdminDocument {
  id: string;
  document_type: string;
  file_name: string;
  file_path: string;
  uploaded_at: string | null;
  verified: boolean | null;
  user_id: string;
  user_email?: string;
}

export const AdminDocumentsTable: React.FC = () => {
  const [documents, setDocuments] = useState<AdminDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        
        // Fetch documents without user information join
        const { data: docsData, error: docsError } = await supabase
          .from("user_documents")
          .select(`
            id,
            document_type,
            file_name,
            file_path,
            uploaded_at,
            verified,
            user_id
          `);
        
        if (docsError) throw docsError;
        
        // Now, for each document, get the user email from profiles or auth metadata
        // We'll use separate queries since we can't directly join with auth.users
        const docsWithUserInfo = await Promise.all(
          docsData.map(async (doc: any) => {
            // Get user email from profiles if available
            const { data: userData, error: userError } = await supabase
              .from("profiles")
              .select("username, full_name")
              .eq("id", doc.user_id)
              .single();
            
            return {
              ...doc,
              user_email: userData?.username || "Unknown User",
            };
          })
        );
        
        setDocuments(docsWithUserInfo);
      } catch (err: any) {
        console.error("Error fetching admin documents:", err);
        setError(err.message);
        toast({
          title: "Error",
          description: "Failed to load documents: " + err.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [toast]);

  const handleDownload = async (doc: AdminDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from("user_documents")
        .download(doc.file_path);
        
      if (error) throw error;
      
      // Create a URL for the blob and trigger download
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.file_name;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error("Error downloading document:", err);
      toast({
        title: "Error",
        description: "Failed to download document: " + err.message,
        variant: "destructive",
      });
    }
  };
  
  const handleVerification = async (docId: string, status: boolean) => {
    try {
      const { error } = await supabase
        .from("user_documents")
        .update({ verified: status })
        .eq("id", docId);
        
      if (error) throw error;
      
      // Update local state
      setDocuments(docs => 
        docs.map(doc => 
          doc.id === docId ? { ...doc, verified: status } : doc
        )
      );
      
      toast({
        title: "Success",
        description: `Document marked as ${status ? 'verified' : 'unverified'}`,
      });
    } catch (err: any) {
      console.error("Error updating verification status:", err);
      toast({
        title: "Error",
        description: "Failed to update verification status: " + err.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading documents...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-destructive">
        <XCircle className="h-8 w-8 mx-auto mb-2" />
        <p>Failed to load documents: {error}</p>
      </div>
    );
  }

  const formatDocumentType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Document Type</TableHead>
            <TableHead>Filename</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No documents have been uploaded yet.
              </TableCell>
            </TableRow>
          ) : (
            documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>{doc.user_email}</TableCell>
                <TableCell>{formatDocumentType(doc.document_type)}</TableCell>
                <TableCell>{doc.file_name}</TableCell>
                <TableCell>
                  {doc.uploaded_at ? format(new Date(doc.uploaded_at), "dd MMM yyyy") : "Unknown"}
                </TableCell>
                <TableCell>
                  {doc.verified === true ? (
                    <Badge className="bg-green-500">Verified</Badge>
                  ) : doc.verified === false ? (
                    <Badge className="bg-red-500">Rejected</Badge>
                  ) : (
                    <Badge variant="outline">Pending</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDownload(doc)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-green-600 hover:text-green-800 hover:bg-green-50" 
                      onClick={() => handleVerification(doc.id, true)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-600 hover:text-red-800 hover:bg-red-50" 
                      onClick={() => handleVerification(doc.id, false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
