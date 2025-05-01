
import React, { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Automatically redirect to admin page
    navigate("/admin");
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
        <p className="text-lg font-medium">Entering Admin Mode...</p>
      </div>
    </div>
  );
};

export default AdminLoginPage;
