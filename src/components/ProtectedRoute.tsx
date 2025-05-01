
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();

  console.log("ProtectedRoute - Auth state:", { isAuthenticated, userId: user?.id });
  
  // Special case for admin page - require authentication and admin email
  if (location.pathname === "/admin") {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in as admin to access this page.",
        variant: "destructive",
      });
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    
    // Check if user has admin email
    if (user?.email !== "admin@gmail.com") {
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
