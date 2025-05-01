
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { adminLogin } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loginAsAdmin = async () => {
      try {
        setIsLoading(true);
        // Attempt to login as admin user
        await adminLogin("admin@gmail.com");
        toast({
          title: "Admin Access Granted",
          description: "Welcome to the admin dashboard."
        });
        navigate("/admin");
      } catch (error: any) {
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
