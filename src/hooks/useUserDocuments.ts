
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export type DocumentType = 'aadhar' | 'pan' | 'driving_license';

export interface UserDocument {
  id: string;
  document_type: DocumentType;
  file_name: string;
  file_path: string;
  uploaded_at: string;
  verified: boolean | null;
}

const ALLOWED_FILE_TYPES = ['application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const useUserDocuments = () => {
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<DocumentType | null>(null);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const fetchUserDocuments = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("user_documents")
        .select("*")
        .eq("user_id", user.id)
        .order("document_type");

      if (error) {
        throw error;
      }

      // Convert data string to our UserDocument type
      const typedDocuments = data?.map(doc => ({
        ...doc,
        document_type: doc.document_type as DocumentType
      })) || [];
      
      setDocuments(typedDocuments);
    } catch (err: any) {
      console.error("Error fetching user documents:", err);
      toast({
        title: "Error fetching documents",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, toast]);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return "Only PDF files are allowed";
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return "File size must be less than 5MB";
    }
    
    return null;
  };

  const uploadDocument = async (file: File, documentType: DocumentType) => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication required",
        description: "Please log in to upload documents",
        variant: "destructive",
      });
      return { success: false };
    }

    const validationError = validateFile(file);
    if (validationError) {
      toast({
        title: "Invalid file",
        description: validationError,
        variant: "destructive",
      });
      return { success: false, error: validationError };
    }

    try {
      setUploading(documentType);
      
      // Create a path with user ID to ensure isolation
      const filePath = `${user.id}/${documentType}/${Date.now()}_${file.name}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("user_documents")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Check if the user already has this document type
      const { data: existingDoc } = await supabase
        .from("user_documents")
        .select("id")
        .eq("user_id", user.id)
        .eq("document_type", documentType)
        .single();

      // Insert or update document metadata in the database
      if (existingDoc) {
        // Update existing document
        const { error: updateError } = await supabase
          .from("user_documents")
          .update({
            file_path: filePath,
            file_name: file.name,
            uploaded_at: new Date().toISOString(),
            verified: false
          })
          .eq("id", existingDoc.id);

        if (updateError) {
          throw updateError;
        }
      } else {
        // Insert new document
        const { error: insertError } = await supabase
          .from("user_documents")
          .insert({
            user_id: user.id,
            document_type: documentType,
            file_path: filePath,
            file_name: file.name
          });

        if (insertError) {
          throw insertError;
        }
      }

      toast({
        title: "Document uploaded",
        description: "Your document has been uploaded successfully",
      });
      
      // Refresh documents list
      await fetchUserDocuments();
      
      return { success: true };
    } catch (err: any) {
      console.error("Error uploading document:", err);
      toast({
        title: "Upload failed",
        description: err.message,
        variant: "destructive",
      });
      return { success: false, error: err.message };
    } finally {
      setUploading(null);
    }
  };

  const downloadDocument = async (documentId: string) => {
    try {
      // First get the document metadata
      const { data, error } = await supabase
        .from("user_documents")
        .select("*")
        .eq("id", documentId)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Document not found");
      }

      // Create download URL
      const { data: fileData, error: downloadError } = await supabase.storage
        .from("user_documents")
        .download(data.file_path);

      if (downloadError) {
        throw downloadError;
      }

      // Create blob URL and trigger download
      const url = URL.createObjectURL(fileData);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.file_name;
      a.click();
      URL.revokeObjectURL(url);

      return { success: true };
    } catch (err: any) {
      console.error("Error downloading document:", err);
      toast({
        title: "Download failed",
        description: err.message,
        variant: "destructive",
      });
      return { success: false, error: err.message };
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      // First get the document metadata to get the file path
      const { data, error } = await supabase
        .from("user_documents")
        .select("file_path")
        .eq("id", documentId)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Document not found");
      }

      // Delete file from storage
      const { error: deleteStorageError } = await supabase.storage
        .from("user_documents")
        .remove([data.file_path]);

      if (deleteStorageError) {
        throw deleteStorageError;
      }

      // Delete metadata record
      const { error: deleteRecordError } = await supabase
        .from("user_documents")
        .delete()
        .eq("id", documentId);

      if (deleteRecordError) {
        throw deleteRecordError;
      }

      toast({
        title: "Document deleted",
        description: "Your document has been deleted successfully",
      });

      // Refresh documents list
      await fetchUserDocuments();

      return { success: true };
    } catch (err: any) {
      console.error("Error deleting document:", err);
      toast({
        title: "Delete failed",
        description: err.message,
        variant: "destructive",
      });
      return { success: false, error: err.message };
    }
  };

  // Fetch documents on load
  useEffect(() => {
    fetchUserDocuments();
  }, [fetchUserDocuments]);

  return {
    documents,
    loading,
    uploading,
    fetchUserDocuments,
    uploadDocument,
    downloadDocument,
    deleteDocument,
  };
};
