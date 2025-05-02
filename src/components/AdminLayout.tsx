
import React from "react";
import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Users, FileText, LayoutDashboard } from "lucide-react";

interface AdminLayoutProps {
  children?: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = React.useState<boolean | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Check if user is an admin using our security definer function
  React.useEffect(() => {
    if (isAuthenticated && user?.id) {
      const checkAdminStatus = async () => {
        try {
          console.log("Checking admin status for user:", user.id);
          const { data, error } = await supabase
            .rpc('is_admin', { _user_id: user.id });
          
          if (error) {
            console.error("Error checking admin status:", error);
            setIsAdmin(false);
          } else {
            console.log("Admin status result:", data);
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
  }, [isAuthenticated, user?.id]);

  React.useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to access this page.",
        variant: "destructive",
      });
    } else if (isAdmin === false) {
      toast({
        title: "Access denied",
        description: "You need administrator privileges to access this page.",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, isAdmin, toast]);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Redirect if not an admin
  if (isAdmin === false) {
    return <Navigate to="/dashboard" replace />;
  }

  // Render admin layout once we confirm admin status
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Admin sidebar */}
      <div className="w-64 bg-slate-800 text-white p-4 flex flex-col">
        <div className="mb-8">
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        
        <nav className="flex flex-col space-y-2 flex-grow">
          <Link to="/admin" className={`p-2 rounded-md flex items-center gap-2 ${location.pathname === '/admin' ? 'bg-slate-700' : 'hover:bg-slate-700'}`}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>
          <Link to="/admin/users" className={`p-2 rounded-md flex items-center gap-2 ${location.pathname === '/admin/users' ? 'bg-slate-700' : 'hover:bg-slate-700'}`}>
            <Users size={18} />
            <span>Users</span>
          </Link>
          <Link to="/admin/documents" className={`p-2 rounded-md flex items-center gap-2 ${location.pathname === '/admin/documents' ? 'bg-slate-700' : 'hover:bg-slate-700'}`}>
            <FileText size={18} />
            <span>Documents</span>
          </Link>
        </nav>

        <div className="mt-auto pt-4 border-t border-slate-700">
          <Link to="/dashboard" className="text-sm text-slate-300 hover:text-white mb-4 block">
            Back to User Dashboard
          </Link>
          <Button 
            variant="outline" 
            className="w-full justify-start text-slate-300 border-slate-600 hover:text-white hover:bg-slate-700"
            onClick={logout}
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {children || <Outlet />}
      </div>
    </div>
  );
};

export default AdminLayout;
