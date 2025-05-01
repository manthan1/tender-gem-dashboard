
import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardHeader from "@/components/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";
import { AdminBidsTable } from "@/components/AdminBidsTable";
import { AdminDocumentsTable } from "@/components/AdminDocumentsTable";

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("bids");

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
