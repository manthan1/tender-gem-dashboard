
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();

  // Check if user is an admin
  const { data: isAdmin, isLoading: checkingAdmin } = useQuery({
    queryKey: ['isAdmin', user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error("Error checking admin status:", error);
        return false;
      }
      return !!data;
    },
    enabled: !!user && location.pathname === "/admin"
  });

  console.log("ProtectedRoute - Auth state:", { isAuthenticated, userId: user?.id, isAdmin, checkingAdmin });
  
  // Special case for admin page - require authentication and admin status
  if (location.pathname === "/admin") {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in as admin to access this page.",
        variant: "destructive",
      });
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    
    if (checkingAdmin) {
      return <div className="flex items-center justify-center h-screen">Verifying admin access...</div>;
    }
    
    // Check if user is admin
    if (!isAdmin) {
      toast({
        title: "Admin access required",
        description: "You don't have permission to access the admin dashboard.",
        variant: "destructive",
      });
      return <Navigate to="/" replace />;
    }
  } 
  // For other routes, just check authentication
  else if (!isAuthenticated) {
    toast({
      title: "Authentication required",
      description: "Please log in to access this page.",
      variant: "destructive",
    });
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Only render children when authentication is confirmed
  return <>{children}</>;
};

export default ProtectedRoute;
