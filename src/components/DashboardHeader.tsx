
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { User, Menu, X, Settings, FileText } from "lucide-react";
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface DashboardHeaderProps {
  onManageKeywords?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onManageKeywords }) => {
  const { logout, user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userInitials = user?.email 
    ? user.email.substring(0, 2).toUpperCase() 
    : "U";

  return (
    <header className="glass-blur border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        {/* Mobile Layout (≤768px) */}
        <div className="flex md:hidden justify-between items-center h-8">
          {/* Mobile Menu Trigger */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 focus-brand">
                <Menu className="h-5 w-5 brand-navy" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 bg-white">
              <div className="flex flex-col h-full">
                <div className="pb-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-navy-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">TT</span>
                    </div>
                    <h1 className="text-xl font-semibold brand-navy font-inter">
                      TenderTimes GeM Dashboard
                    </h1>
                  </div>
                </div>
                
                {isAuthenticated && (
                  <div className="space-y-3 flex-1">
                    <Button
                      onClick={() => {
                        onManageKeywords?.();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full h-12 bg-navy-500 hover:bg-navy-600 text-white rounded-xl font-medium"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Keywords
                    </Button>
                    <Link to="/documents" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full h-12 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-medium">
                        <FileText className="h-4 w-4 mr-2" />
                        My Documents
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Mobile Logo */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-navy-500 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">TT</span>
            </div>
            <span className="text-lg font-semibold brand-navy font-inter">TenderTimes</span>
          </div>

          {/* Mobile Avatar */}
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

        {/* Desktop Layout (≥768px) */}
        <div className="hidden md:flex justify-between items-center">
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
      </div>
    </header>
  );
};

export default DashboardHeader;
