
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    // Simplified direct access - no login required
    console.log("Bypassing admin authentication, going directly to admin dashboard");
    
    toast({
      title: "Admin Access Granted",
      description: "Direct access to admin dashboard"
    });
    
    // Redirect to admin dashboard
    navigate("/admin");
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
        <p className="text-lg font-medium">Accessing Admin Dashboard...</p>
      </div>
    </div>
  );
};

export default AdminLoginPage;
