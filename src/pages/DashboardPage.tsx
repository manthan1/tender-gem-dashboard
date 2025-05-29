
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardHeader from "@/components/DashboardHeader";
import AdvancedFilterBar from "@/components/AdvancedFilterBar";
import TenderTable from "@/components/TenderTable";
import TablePagination from "@/components/TablePagination";
import UserBidsTable from "@/components/UserBidsTable";
import KeywordFilterToggle from "@/components/KeywordFilterToggle";
import KeywordsManager from "@/components/KeywordsManager";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Settings, TrendingUp } from "lucide-react";
import { useGemBids, useFilterOptions } from "@/hooks/useGemBids";
import { useUserBids } from "@/hooks/useUserBids";
import { useUserKeywords } from "@/hooks/useUserKeywords";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Filters {
  ministry: string;
  department: string;
  city: string; // Added city filter
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  search: string;
  useKeywordFiltering: boolean;
}

const DashboardPage = () => {
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const { getUserKeywords } = useUserKeywords();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("tenders");
  const [keywordsDialogOpen, setKeywordsDialogOpen] = useState(false);
  const [userKeywords, setUserKeywords] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filters>({
    ministry: "",
    department: "",
    city: "", // Added city to initial state
    dateRange: {
      from: null,
      to: null,
    },
    search: "",
    useKeywordFiltering: true,
  });

  // Process filters to handle 'all' value
  const processedFilters = useMemo(() => ({
    ...filters,
    ministry: filters.ministry === "all" ? "" : filters.ministry,
    department: filters.department === "all" ? "" : filters.department,
    city: filters.city === "all" ? "" : filters.city, // Added city processing
  }), [filters]);

  // Initialize data fetching
  const { bids, totalPages, totalCount, loading, error, hasKeywords, refetch } = useGemBids(currentPage, processedFilters);
  
  // Get user's bids
  const { bids: userBids, loading: userBidsLoading } = useUserBids();
  
  // Get filter options - now includes cities
  const { options: ministries } = useFilterOptions("ministry");
  const { options: departments } = useFilterOptions("department");
  const { options: cities } = useFilterOptions("city");

  // Load user keywords
  const loadUserKeywords = useCallback(async () => {
    const keywords = await getUserKeywords();
    setUserKeywords(keywords);
  }, [getUserKeywords]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserKeywords();
    }
  }, [isAuthenticated, user, loadUserKeywords]);

  // Handle filter changes - now includes city
  const handleFilterChange = useCallback((newFilters: Omit<Filters, 'useKeywordFiltering'>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  }, []);

  // Handle keyword filter toggle
  const handleKeywordFilterChange = useCallback((enabled: boolean) => {
    setFilters(prev => ({ ...prev, useKeywordFiltering: enabled }));
    setCurrentPage(1);
  }, []);

  // Handle page changes
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    console.log("Refreshing dashboard data...");
    await refetch();
    await loadUserKeywords();
  }, [refetch, loadUserKeywords]);

  // Handle keywords update
  const handleKeywordsUpdate = useCallback(() => {
    loadUserKeywords();
    refetch();
    setKeywordsDialogOpen(false);
  }, [loadUserKeywords, refetch]);

  // Force refetch when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("Authentication detected, fetching data...");
      refetch();
    }
  }, [isAuthenticated, user, refetch]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast({
        title: "Error fetching data",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  return (
    <div className="min-h-screen bg-brand-light-gray">
      <DashboardHeader onRefresh={handleRefresh} />
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        {/* Page Title Row */}
        <div className="px-4 sm:px-0 mb-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold brand-navy font-inter">Tender Portal</h1>
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-full border border-orange-200">
              <TrendingUp className="h-4 w-4 brand-orange" />
              <span className="text-sm font-semibold brand-orange font-inter">
                {totalCount.toLocaleString()} Active Tenders
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            {isAuthenticated && (
              <Dialog open={keywordsDialogOpen} onOpenChange={setKeywordsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="border border-navy-500 text-navy-500 hover:bg-navy-50 focus-brand">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Keywords
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md rounded-3xl shadow-2xl">
                  <DialogHeader>
                    <DialogTitle className="font-semibold brand-navy">Manage Keywords</DialogTitle>
                  </DialogHeader>
                  <KeywordsManager onKeywordsUpdate={handleKeywordsUpdate} />
                </DialogContent>
              </Dialog>
            )}
            <Link to="/documents">
              <Button variant="outline" className="border-gray-300 hover:bg-gray-50 focus-brand">
                <FileText className="h-4 w-4 mr-2" />
                My Documents
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="px-4 sm:px-0">
          {/* Segmented Pill Tabs */}
          <Tabs defaultValue="tenders" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8 bg-gray-100 p-1 rounded-full h-12">
              <TabsTrigger 
                value="tenders" 
                className="flex items-center gap-2 rounded-full px-6 py-2 data-[state=active]:bg-white data-[state=active]:text-navy-500 data-[state=active]:shadow-sm transition-all duration-200"
              >
                <FileText className="h-4 w-4" />
                All Tenders
              </TabsTrigger>
              {isAuthenticated && (
                <TabsTrigger 
                  value="my-bids" 
                  className="flex items-center gap-2 rounded-full px-6 py-2 data-[state=active]:bg-white data-[state=active]:text-navy-500 data-[state=active]:shadow-sm transition-all duration-200"
                >
                  <TrendingUp className="h-4 w-4" />
                  My Bids
                </TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="tenders" className="space-y-6">
              {/* Keyword Filter Toggle */}
              {isAuthenticated && (
                <Card className="table-shadow border-0 rounded-2xl bg-white">
                  <CardContent className="pt-6">
                    <KeywordFilterToggle
                      enabled={filters.useKeywordFiltering}
                      onChange={handleKeywordFilterChange}
                      hasKeywords={hasKeywords}
                      keywordCount={userKeywords.length}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Filters */}
              <AdvancedFilterBar
                ministries={ministries}
                departments={departments}
                cities={cities}
                onFilterChange={handleFilterChange}
                currentFilters={filters}
                totalResults={totalCount}
              />

              {/* Table */}
              <Card className="table-shadow border-0 rounded-2xl bg-white overflow-hidden">
                <CardContent className="p-0">
                  <TenderTable bids={bids} loading={loading} />
                </CardContent>
              </Card>

              {/* Pagination */}
              {!loading && totalPages > 1 && (
                <TablePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </TabsContent>
            
            <TabsContent value="my-bids">
              {isAuthenticated ? (
                <Card className="table-shadow border-0 rounded-2xl bg-white">
                  <UserBidsTable bids={userBids} loading={userBidsLoading} />
                </Card>
              ) : (
                <Card className="table-shadow border-0 rounded-2xl bg-white">
                  <CardContent className="flex justify-center items-center h-32">
                    <p className="text-brand-gray-500">Please log in to view your bids.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default React.memo(DashboardPage);
