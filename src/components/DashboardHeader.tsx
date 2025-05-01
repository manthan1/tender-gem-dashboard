
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const DashboardHeader = () => {
  const { logout, user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleFetchNewBids = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-gem-bids');
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast({
        title: "Data fetching completed",
        description: data.message || "Bid data has been updated",
        variant: "default",
      });
    } catch (error) {
      console.error("Error fetching bids:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch new bids",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const userInitials = user?.email 
    ? user.email.substring(0, 2).toUpperCase() 
    : "U";

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">GeM Tenders Dashboard</h1>
        <div className="flex gap-2 items-center">
          <Button 
            variant="outline" 
            onClick={handleFetchNewBids} 
            disabled={loading}
            className="flex gap-2 items-center"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? "Fetching..." : "Fetch New Bids"}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                <User className="mr-2 h-4 w-4" />
                {user?.email}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
