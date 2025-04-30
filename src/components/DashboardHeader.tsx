
import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const DashboardHeader = () => {
  const { logout } = useAuth();

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">GeM Tenders Dashboard</h1>
        <Button variant="outline" onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  );
};

export default DashboardHeader;
