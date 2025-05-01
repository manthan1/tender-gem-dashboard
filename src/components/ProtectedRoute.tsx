
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

  console.log("ProtectedRoute - Path:", location.pathname);
  
  // Special case for admin pages - bypass authentication checks
  if (location.pathname === "/admin" || location.pathname.startsWith("/admin/")) {
    // Direct access to admin pages, no checks needed
    console.log("Admin route - bypassing authentication checks");
    return <>{children}</>;
  } 
  // For other routes, check authentication
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
