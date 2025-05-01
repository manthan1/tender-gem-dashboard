
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardHeader from "@/components/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { AdminBidsTable } from "@/components/AdminBidsTable";
import { AdminDocumentsTable } from "@/components/AdminDocumentsTable";

const AdminPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("bids");
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    // Check if user is admin - in a real app, you would check a database role
    // For now, let's assume a specific user ID is an admin
    if (user) {
      // This is a simplified check - in a production app you'd use proper role-based checks
      if (user.email === "admin@example.com") {
        setIsAdmin(true);
      } else {
        toast({
          title: "Access denied",
          description: "You don't have admin privileges",
          variant: "destructive",
        });
      }
    }
  }, [user, toast]);

  // Redirect to dashboard if not authenticated or not admin
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  if (isAuthenticated && !isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | GEM Tender Portal</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          
          <Tabs defaultValue="bids" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="bids">User Bids</TabsTrigger>
              <TabsTrigger value="documents">User Documents</TabsTrigger>
            </TabsList>
            
            <TabsContent value="bids">
              <Card>
                <CardContent className="p-0">
                  <AdminBidsTable />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="documents">
              <Card>
                <CardContent className="p-0">
                  <AdminDocumentsTable />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
};

export default AdminPage;
