
import React from "react";
import { Helmet } from "react-helmet";
import DashboardHeader from "@/components/DashboardHeader";
import { DocumentUpload } from "@/components/DocumentUpload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const DocumentsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <>
      <Helmet>
        <title>My Documents | GEM Tender Portal</title>
      </Helmet>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <DashboardHeader />
        <main className="flex-1 container mx-auto py-6 px-4">
          <h1 className="text-2xl font-bold mb-6">My Documents</h1>
          
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Upload your identification documents to participate in government tenders. 
              All documents must be in PDF format and will be verified by our team.
              Verified documents are marked with a green checkmark.
            </AlertDescription>
          </Alert>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Document Requirements</CardTitle>
              <CardDescription>
                Please ensure all uploaded documents meet the following requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                <li>All documents must be in PDF format</li>
                <li>Maximum file size: 5MB per document</li>
                <li>Documents must be clearly legible and not expired</li>
                <li>Documents will be verified before you can use them for bidding</li>
                <li>Uploading a new document will replace the previous one</li>
              </ul>
            </CardContent>
          </Card>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Identity Documents</h2>
            <DocumentUpload />
          </div>
        </main>
      </div>
    </>
  );
};

export default DocumentsPage;
