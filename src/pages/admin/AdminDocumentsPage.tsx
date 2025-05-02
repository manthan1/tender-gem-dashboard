
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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Download, Check, File } from "lucide-react";

interface Profile {
  full_name: string | null;
  id: string;
}

interface UserDocument {
  id: string;
  user_id: string;
  document_type: string;
  file_name: string;
  file_path: string;
  uploaded_at: string;
  verified: boolean | null;
  profile?: Profile;
}

interface GroupedDocuments {
  [userId: string]: {
    userName: string;
    documents: {
      [documentType: string]: UserDocument;
    };
  }
}

const AdminDocumentsPage = () => {
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);
  const [verifyingDoc, setVerifyingDoc] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
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

      // Fetch all documents with file_path included
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

  const downloadDocument = async (userDoc: UserDocument) => {
    try {
      // Create download URL
      const { data, error } = await supabase.storage
        .from("user_documents")
        .download(userDoc.file_path);

      if (error) {
        throw error;
      }

      // Create blob URL and trigger download using window.document
      const url = URL.createObjectURL(data);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = userDoc.file_name;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Download started",
        description: `Downloading ${userDoc.file_name}`,
      });
    } catch (error: any) {
      console.error("Error downloading document:", error);
      toast({
        title: "Download failed",
        description: error.message || "Failed to download document",
        variant: "destructive",
      });
    }
  };
  
  const verifyDocument = async (docId: string) => {
    setVerifyingDoc(docId);
    try {
      const { error } = await supabase
        .from('user_documents')
        .update({ verified: true })
        .eq('id', docId);
        
      if (error) throw error;
      
      toast({
        title: "Document verified",
        description: "Document has been marked as verified"
      });
      
      // Refresh the documents list
      fetchData();
      
    } catch (error: any) {
      console.error("Error verifying document:", error);
      toast({
        title: "Verification failed",
        description: error.message || "Failed to verify document",
        variant: "destructive",
      });
    } finally {
      setVerifyingDoc(null);
    }
  };

  // Group documents by user
  const groupedDocuments = documents.reduce((acc: GroupedDocuments, doc) => {
    const userId = doc.user_id;
    const userName = doc.profile?.full_name || userId;
    
    if (!acc[userId]) {
      acc[userId] = {
        userName,
        documents: {}
      };
    }
    
    acc[userId].documents[doc.document_type] = doc;
    return acc;
  }, {});

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">User Documents</h1>

      <Card>
        <CardHeader>
          <CardTitle>All Documents</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-medium">User</TableHead>
                    <TableHead className="font-medium">Aadhar</TableHead>
                    <TableHead className="font-medium">PAN</TableHead>
                    <TableHead className="font-medium">Driving License</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array(5).fill(0).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
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
                    <TableHead className="font-medium">Aadhar</TableHead>
                    <TableHead className="font-medium">PAN</TableHead>
                    <TableHead className="font-medium">Driving License</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.keys(groupedDocuments).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">No documents found</TableCell>
                    </TableRow>
                  ) : (
                    Object.entries(groupedDocuments).map(([userId, userData]) => (
                      <TableRow key={userId}>
                        <TableCell>
                          {userData.userName || "Unknown User"}
                          <div className="text-xs text-gray-500 mt-1 font-mono">
                            {userId}
                          </div>
                        </TableCell>
                        <TableCell>
                          {userData.documents['aadhar'] ? (
                            <div className="flex flex-col gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex items-center gap-1 w-fit"
                                onClick={() => downloadDocument(userData.documents['aadhar'])}
                              >
                                <Download className="h-3 w-3" />
                                <span>Aadhar</span>
                                <Badge variant={userData.documents['aadhar'].verified ? "default" : "outline"} className="ml-1 text-xs">
                                  {userData.documents['aadhar'].verified ? "Verified" : "Pending"}
                                </Badge>
                              </Button>
                              {!userData.documents['aadhar'].verified && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="flex items-center gap-1 w-fit text-green-600"
                                  disabled={verifyingDoc === userData.documents['aadhar'].id}
                                  onClick={() => verifyDocument(userData.documents['aadhar'].id)}
                                >
                                  <Check className="h-3 w-3" />
                                  <span>{verifyingDoc === userData.documents['aadhar'].id ? 'Verifying...' : 'Verify'}</span>
                                </Button>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Not uploaded</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {userData.documents['pan'] ? (
                            <div className="flex flex-col gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex items-center gap-1 w-fit"
                                onClick={() => downloadDocument(userData.documents['pan'])}
                              >
                                <Download className="h-3 w-3" />
                                <span>PAN</span>
                                <Badge variant={userData.documents['pan'].verified ? "default" : "outline"} className="ml-1 text-xs">
                                  {userData.documents['pan'].verified ? "Verified" : "Pending"}
                                </Badge>
                              </Button>
                              {!userData.documents['pan'].verified && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="flex items-center gap-1 w-fit text-green-600"
                                  disabled={verifyingDoc === userData.documents['pan'].id}
                                  onClick={() => verifyDocument(userData.documents['pan'].id)}
                                >
                                  <Check className="h-3 w-3" />
                                  <span>{verifyingDoc === userData.documents['pan'].id ? 'Verifying...' : 'Verify'}</span>
                                </Button>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Not uploaded</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {userData.documents['driving_license'] ? (
                            <div className="flex flex-col gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex items-center gap-1 w-fit"
                                onClick={() => downloadDocument(userData.documents['driving_license'])}
                              >
                                <Download className="h-3 w-3" />
                                <span>License</span>
                                <Badge variant={userData.documents['driving_license'].verified ? "default" : "outline"} className="ml-1 text-xs">
                                  {userData.documents['driving_license'].verified ? "Verified" : "Pending"}
                                </Badge>
                              </Button>
                              {!userData.documents['driving_license'].verified && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="flex items-center gap-1 w-fit text-green-600"
                                  disabled={verifyingDoc === userData.documents['driving_license'].id}
                                  onClick={() => verifyDocument(userData.documents['driving_license'].id)}
                                >
                                  <Check className="h-3 w-3" />
                                  <span>{verifyingDoc === userData.documents['driving_license'].id ? 'Verifying...' : 'Verify'}</span>
                                </Button>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Not uploaded</span>
                          )}
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
    </div>
  );
};

export default AdminDocumentsPage;
