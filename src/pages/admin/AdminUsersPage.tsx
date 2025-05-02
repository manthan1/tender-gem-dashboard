
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Shield, User, AlertCircle } from "lucide-react";

interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  created_at: string;
  updated_at: string;
}

interface UserWithBidsCounts extends Profile {
  bids_count: number;
  documents_count: number;
  is_admin: boolean;
}

const AdminUsersPage = () => {
  const [users, setUsers] = useState<UserWithBidsCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [makingAdmin, setMakingAdmin] = useState<string | null>(null);
  const [removingAdmin, setRemovingAdmin] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // First get all user profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;
      
      // Get admin users
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('id');

      if (adminError) throw adminError;

      // Create a set of admin user IDs for quick lookup
      const adminUserIds = new Set(adminData.map(admin => admin.id));

      // For each user, get their bid count and document count
      const usersWithCounts = await Promise.all((profilesData || []).map(async (profile: Profile) => {
        // Get count of bids
        const { count: bidsCount, error: bidsError } = await supabase
          .from('user_bids')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.id);

        if (bidsError) throw bidsError;

        // Get count of documents
        const { count: docsCount, error: docsError } = await supabase
          .from('user_documents')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.id);

        if (docsError) throw docsError;

        return {
          ...profile,
          bids_count: bidsCount || 0,
          documents_count: docsCount || 0,
          is_admin: adminUserIds.has(profile.id)
        };
      }));

      setUsers(usersWithCounts);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error fetching users",
        description: error.message || "Failed to load user data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const makeAdmin = async (userId: string) => {
    setMakingAdmin(userId);
    try {
      const { error } = await supabase
        .from('admin_users')
        .insert({ id: userId });
        
      if (error) throw error;
      
      toast({
        title: "User promoted",
        description: "User has been given admin privileges"
      });
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, is_admin: true } : user
        )
      );
    } catch (error: any) {
      console.error("Error making user admin:", error);
      toast({
        title: "Action failed",
        description: error.message || "Failed to make user an admin",
        variant: "destructive",
      });
    } finally {
      setMakingAdmin(null);
    }
  };
  
  const removeAdmin = async (userId: string) => {
    setRemovingAdmin(userId);
    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', userId);
        
      if (error) throw error;
      
      toast({
        title: "Admin access removed",
        description: "User's admin privileges have been removed"
      });
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, is_admin: false } : user
        )
      );
    } catch (error: any) {
      console.error("Error removing admin:", error);
      toast({
        title: "Action failed",
        description: error.message || "Failed to remove admin privileges",
        variant: "destructive",
      });
    } finally {
      setRemovingAdmin(null);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-medium">User</TableHead>
                    <TableHead className="font-medium">Joined</TableHead>
                    <TableHead className="font-medium">Status</TableHead>
                    <TableHead className="font-medium">Bids</TableHead>
                    <TableHead className="font-medium">Documents</TableHead>
                    <TableHead className="font-medium">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array(5).fill(0).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20" /></TableCell>
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
                    <TableHead className="font-medium">Joined</TableHead>
                    <TableHead className="font-medium">Status</TableHead>
                    <TableHead className="font-medium">Bids</TableHead>
                    <TableHead className="font-medium">Documents</TableHead>
                    <TableHead className="font-medium">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">No users found</TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                              <User size={14} className="text-primary" />
                            </div>
                            <div>
                              {user.full_name || "Unnamed User"}
                              <div className="text-xs text-gray-500">{user.username || "No username"}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{format(new Date(user.created_at), "dd MMM yyyy")}</TableCell>
                        <TableCell>
                          {user.is_admin ? (
                            <Badge className="bg-purple-600">Admin</Badge>
                          ) : (
                            <Badge variant="outline">User</Badge>
                          )}
                        </TableCell>
                        <TableCell>{user.bids_count}</TableCell>
                        <TableCell>{user.documents_count}</TableCell>
                        <TableCell>
                          {user.is_admin ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="flex items-center gap-1"
                              disabled={removingAdmin === user.id}
                              onClick={() => removeAdmin(user.id)}
                            >
                              <AlertCircle className="h-3 w-3" />
                              {removingAdmin === user.id ? 'Removing...' : 'Remove Admin'}
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="flex items-center gap-1"
                              disabled={makingAdmin === user.id}
                              onClick={() => makeAdmin(user.id)}
                            >
                              <Shield className="h-3 w-3" />
                              {makingAdmin === user.id ? 'Making Admin...' : 'Make Admin'}
                            </Button>
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

export default AdminUsersPage;
