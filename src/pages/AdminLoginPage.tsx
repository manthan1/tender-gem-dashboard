
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { adminLogin } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loginAsAdmin = async () => {
      try {
        setIsLoading(true);
        // Check if user is already in admin_users table
        const { data: adminData, error: adminCheckError } = await supabase
          .from('admin_users')
          .select('id')
          .limit(1);
          
        if (adminCheckError) {
          throw new Error("Could not verify admin status: " + adminCheckError.message);
        }
        
        // If no admin exists yet, we'll use the current user or create one
        if (!adminData || adminData.length === 0) {
          console.log("No admin users found. Setting up admin account...");
          
          // Try to log in with admin credentials
          await adminLogin("admin@example.com");
          
          toast({
            title: "Admin Account Created",
            description: "You are the first admin user for this system."
          });
        } else {
          // Admin already exists, proceed with normal login
          await adminLogin("admin@example.com");
          
          toast({
            title: "Admin Access Granted",
            description: "Welcome to the admin dashboard."
          });
        }
        
        navigate("/admin");
      } catch (error: any) {
        console.error("Admin login error:", error);
        toast({
          title: "Admin Access Failed",
          description: error.message || "Could not access admin mode",
          variant: "destructive"
        });
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };
    
    loginAsAdmin();
  }, [adminLogin, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
        <p className="text-lg font-medium">Authenticating Admin Access...</p>
      </div>
    </div>
  );
};

export default AdminLoginPage;
