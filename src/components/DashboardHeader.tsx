
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const DashboardHeader: React.FC = () => {
  const { logout, user } = useAuth();

  const userInitials = user?.email 
    ? user.email.substring(0, 2).toUpperCase() 
    : "U";

  return (
    <header className="glass-blur border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-navy-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">TT</span>
          </div>
          <h1 className="text-2xl font-semibold brand-navy font-inter">
            TenderTimes GeM Dashboard
          </h1>
        </div>
        
        <div className="flex gap-3 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 focus-brand">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-navy-500 text-white text-xs font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200 shadow-lg rounded-xl">
              <DropdownMenuLabel className="font-semibold text-navy-500">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled className="text-gray-500">
                <User className="mr-2 h-4 w-4" />
                {user?.email}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()} className="text-red-600 focus:bg-red-50">
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
