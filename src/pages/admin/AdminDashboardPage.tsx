
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Stats {
  users: number;
  documents: number;
  verifiedDocuments: number;
  bids: number;
}

const AdminDashboardPage = () => {
  const [stats, setStats] = useState<Stats>({ users: 0, documents: 0, verifiedDocuments: 0, bids: 0 });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Fetch user count
        const { count: usersCount, error: usersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (usersError) throw usersError;

        // Fetch documents count
        const { count: documentsCount, error: documentsError } = await supabase
          .from('user_documents')
          .select('*', { count: 'exact', head: true });

        if (documentsError) throw documentsError;

        // Fetch verified documents count
        const { count: verifiedCount, error: verifiedError } = await supabase
          .from('user_documents')
          .select('*', { count: 'exact', head: true })
          .eq('verified', true);

        if (verifiedError) throw verifiedError;

        // Fetch bids count
        const { count: bidsCount, error: bidsError } = await supabase
          .from('user_bids')
          .select('*', { count: 'exact', head: true });

        if (bidsError) throw bidsError;

        setStats({
          users: usersCount || 0,
          documents: documentsCount || 0,
          verifiedDocuments: verifiedCount || 0,
          bids: bidsCount || 0
        });
      } catch (error: any) {
        console.error("Error fetching admin dashboard stats:", error);
        toast({
          title: "Error fetching stats",
          description: error.message || "Failed to load admin dashboard statistics",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [toast]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <p className="text-2xl font-bold">{stats.users}</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Documents</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <p className="text-2xl font-bold">{stats.documents}</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Verified Documents</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <p className="text-2xl font-bold">{stats.verifiedDocuments} <span className="text-sm text-gray-500">({Math.round((stats.verifiedDocuments / stats.documents) * 100) || 0}%)</span></p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Bids</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <p className="text-2xl font-bold">{stats.bids}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
