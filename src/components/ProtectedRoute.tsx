
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(adminOnly);

  console.log("ProtectedRoute - Auth state:", { isAuthenticated, userId: user?.id });

  // Check if user is an admin when needed using our security definer function
  useEffect(() => {
    if (adminOnly && isAuthenticated && user?.id) {
      const checkAdminStatus = async () => {
        try {
          const { data, error } = await supabase
            .rpc('is_admin', { _user_id: user.id });
          
          if (error) {
            console.error("Error checking admin status:", error);
            setIsAdmin(false);
          } else {
            setIsAdmin(!!data);
          }
        } catch (err) {
          console.error("Failed to check admin status:", err);
          setIsAdmin(false);
        } finally {
          setIsLoading(false);
        }
      };
      
      checkAdminStatus();
    }
  }, [adminOnly, isAuthenticated, user?.id]);

  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to access this page.",
        variant: "destructive",
      });
    } else if (adminOnly && isAdmin === false) {
      toast({
        title: "Access denied",
        description: "You need administrator privileges to access this page.",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, adminOnly, isAdmin, toast]);

  if (!isAuthenticated) {
    // Redirect to login but remember where they were trying to go
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (adminOnly) {
    // Still loading admin status
    if (isLoading) {
      return <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>;
    }
    
    // Not an admin
    if (!isAdmin) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Only render children when authentication (and admin check if required) is confirmed
  return <>{children}</>;
};

export default ProtectedRoute;
