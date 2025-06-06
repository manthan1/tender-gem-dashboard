import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import DashboardHeader from "@/components/DashboardHeader";
import AdvancedFilterBar from "@/components/AdvancedFilterBar";
import TenderTable from "@/components/TenderTable";
import TablePagination from "@/components/TablePagination";
import UserBidsTable from "@/components/UserBidsTable";
import KeywordFilterToggle from "@/components/KeywordFilterToggle";
import KeywordsManager from "@/components/KeywordsManager";
import TenderTrendsChart from "@/components/TenderTrendsChart";
import RecentActivityFeed from "@/components/RecentActivityFeed";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Settings, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { useGemBids, useFilterOptions } from "@/hooks/useGemBids";
import { useUserBids } from "@/hooks/useUserBids";
import { useUserKeywords } from "@/hooks/useUserKeywords";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Filters {
  ministry: string;
  department: string;
  city: string;
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
  const [searchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("tenders");
  const [keywordsDialogOpen, setKeywordsDialogOpen] = useState(false);
  const [userKeywords, setUserKeywords] = useState<string[]>([]);
  const [keywordFilterExpanded, setKeywordFilterExpanded] = useState(false);
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    ministry: "",
    department: "",
    city: "",
    dateRange: {
      from: null,
      to: null,
    },
    search: searchParams.get('search') || "",
    useKeywordFiltering: true,
  });

  // Process filters to handle 'all' value
  const processedFilters = useMemo(() => ({
    ...filters,
    ministry: filters.ministry === "all" ? "" : filters.ministry,
    department: filters.department === "all" ? "" : filters.department,
    city: filters.city === "all" ? "" : filters.city,
  }), [filters]);

  // Initialize data fetching
  const { bids, totalPages, totalCount, loading, error, hasKeywords, refetch } = useGemBids(currentPage, processedFilters);
  
  // Get user's bids
  const { bids: userBids, loading: userBidsLoading } = useUserBids();
  
  // Get filter options
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

  // Handle filter changes
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
      <DashboardHeader onManageKeywords={() => setKeywordsDialogOpen(true)} />
      <main className="max-w-7xl mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
        {/* Page Title Row */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <h1 className="text-2xl sm:text-3xl font-bold brand-navy font-inter">Tender Portal</h1>
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-orange-50 rounded-full border border-orange-200 w-fit">
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
                    <Button variant="ghost" className="border border-navy-500 text-navy-500 hover:bg-navy-50 focus-brand hidden sm:flex">
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
              <Link to="/documents" className="hidden sm:block">
                <Button variant="outline" className="border-gray-300 hover:bg-gray-50 focus-brand">
                  <FileText className="h-4 w-4 mr-2" />
                  My Documents
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Analytics Dashboard */}
        {isAuthenticated && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
            <TenderTrendsChart />
            <RecentActivityFeed />
          </div>
        )}

        <div className="space-y-4 sm:space-y-6">
          {/* Mobile-First Tabs */}
          <Tabs defaultValue="tenders" value={activeTab} onValueChange={setActiveTab}>
            {/* Mobile Toggle Bar (≤480px) */}
            <div className="sm:hidden">
              <div className="bg-gray-100 p-1 rounded-full h-12 flex">
                <button
                  onClick={() => setActiveTab("tenders")}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-full px-4 py-2 transition-all duration-200 min-h-[44px] ${
                    activeTab === "tenders" ? "bg-white text-navy-500 shadow-sm" : "text-gray-600"
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">All Tenders</span>
                </button>
                {isAuthenticated && (
                  <button
                    onClick={() => setActiveTab("my-bids")}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-full px-4 py-2 transition-all duration-200 min-h-[44px] ${
                      activeTab === "my-bids" ? "bg-white text-navy-500 shadow-sm" : "text-gray-600"
                    }`}
                  >
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">My Bids</span>
                  </button>
                )}
              </div>
            </div>

            {/* Desktop Tabs (≥480px) */}
            <TabsList className="hidden sm:flex mb-8 bg-gray-100 p-1 rounded-full h-12">
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
            
            <TabsContent value="tenders" className="space-y-4 sm:space-y-6">
              {/* Keyword Filter Banner */}
              {isAuthenticated && (
                <Card className="table-shadow border-0 rounded-2xl bg-white overflow-hidden">
                  <CardContent className="p-0">
                    {/* Mobile Compact Banner (≤768px) */}
                    <div className="md:hidden">
                      <Collapsible open={keywordFilterExpanded} onOpenChange={setKeywordFilterExpanded}>
                        <CollapsibleTrigger asChild>
                          <button className="w-full h-12 px-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors border-b border-gray-100 min-h-[48px]">
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded-full ${filters.useKeywordFiltering && hasKeywords ? 'bg-orange-500' : 'bg-gray-300'}`} />
                              <span className="text-sm font-medium brand-navy">
                                {filters.useKeywordFiltering && hasKeywords ? 'Keyword filtering active' : 'Keyword filtering off'}
                              </span>
                            </div>
                            {keywordFilterExpanded ? (
                              <ChevronUp className="h-4 w-4 text-gray-500" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            )}
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="transition-all duration-200">
                          <div className="p-4 border-t border-gray-100">
                            <KeywordFilterToggle
                              enabled={filters.useKeywordFiltering}
                              onChange={handleKeywordFilterChange}
                              hasKeywords={hasKeywords}
                              keywordCount={userKeywords.length}
                            />
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>

                    {/* Desktop Banner (≥768px) */}
                    <div className="hidden md:block pt-6">
                      <KeywordFilterToggle
                        enabled={filters.useKeywordFiltering}
                        onChange={handleKeywordFilterChange}
                        hasKeywords={hasKeywords}
                        keywordCount={userKeywords.length}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Search & Advanced Filters */}
              <Card className="table-shadow border-0 rounded-2xl bg-white overflow-hidden">
                <CardContent className="p-0">
                  {/* Mobile Layout */}
                  <div className="md:hidden">
                    {/* Full-width Search */}
                    <div className="p-4 border-b border-gray-100">
                      <input
                        type="text"
                        placeholder="Search tenders..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange({ ...filters, search: e.target.value })}
                        className="w-full h-12 px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-inner"
                      />
                    </div>

                    {/* Advanced Filters Accordion */}
                    <Collapsible open={advancedFiltersOpen} onOpenChange={setAdvancedFiltersOpen}>
                      <CollapsibleTrigger asChild>
                        <button className="w-full h-12 px-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors min-h-[48px]">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium brand-navy">Advanced Filters</span>
                            <div className="text-xs text-gray-500">
                              ({totalCount.toLocaleString()} results)
                            </div>
                          </div>
                          {advancedFiltersOpen ? (
                            <ChevronUp className="h-4 w-4 text-gray-500 transition-transform duration-200" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-500 transition-transform duration-200" />
                          )}
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="transition-all duration-200">
                        <div className="border-t border-gray-100">
                          <AdvancedFilterBar
                            ministries={ministries}
                            departments={departments}
                            cities={cities}
                            onFilterChange={handleFilterChange}
                            currentFilters={filters}
                            totalResults={totalCount}
                          />
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden md:block">
                    <AdvancedFilterBar
                      ministries={ministries}
                      departments={departments}
                      cities={cities}
                      onFilterChange={handleFilterChange}
                      currentFilters={filters}
                      totalResults={totalCount}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Table/Cards */}
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

      {/* Keywords Dialog */}
      <Dialog open={keywordsDialogOpen} onOpenChange={setKeywordsDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-semibold brand-navy">Manage Keywords</DialogTitle>
          </DialogHeader>
          <KeywordsManager onKeywordsUpdate={handleKeywordsUpdate} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default React.memo(DashboardPage);
