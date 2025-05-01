
import React, { useState, useCallback, useMemo, useEffect } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import FilterBar from "@/components/FilterBar";
import TenderTable from "@/components/TenderTable";
import TablePagination from "@/components/TablePagination";
import UserBidsTable from "@/components/UserBidsTable";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGemBids, useFilterOptions } from "@/hooks/useGemBids";
import { useUserBids } from "@/hooks/useUserBids";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Filters {
  ministry: string;
  department: string;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  search: string;
}

const DashboardPage = () => {
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("tenders");
  const [filters, setFilters] = useState<Filters>({
    ministry: "",
    department: "",
    dateRange: {
      from: null,
      to: null,
    },
    search: "",
  });

  // Process filters to handle 'all' value - memoize to prevent unnecessary recalculations
  const processedFilters = useMemo(() => ({
    ...filters,
    ministry: filters.ministry === "all" ? "" : filters.ministry,
    department: filters.department === "all" ? "" : filters.department,
  }), [filters]);

  // Initialize data fetching with the optimized hook
  const { bids, totalPages, loading, error, refetch } = useGemBids(currentPage, processedFilters);
  
  // Get user's bids
  const { bids: userBids, loading: userBidsLoading } = useUserBids();
  
  // Get filter options with cached data
  const { options: ministries } = useFilterOptions("ministry");
  const { options: departments } = useFilterOptions("department");

  // Handle filter changes - memoized for performance
  const handleFilterChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  // Handle page changes - memoized for performance
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Handle refresh requests from DashboardHeader
  const handleRefresh = useCallback(async () => {
    console.log("Refreshing dashboard data...");
    await refetch();
  }, [refetch]);

  // Force refetch data when authenticated status changes
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("Authentication detected, fetching data...");
      refetch();
    }
  }, [isAuthenticated, user, refetch]);

  // Show error toast if API call fails
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
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader onRefresh={handleRefresh} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <Tabs defaultValue="tenders" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="tenders">All Tenders</TabsTrigger>
              {isAuthenticated && <TabsTrigger value="my-bids">My Bids</TabsTrigger>}
            </TabsList>
            
            <TabsContent value="tenders">
              <FilterBar
                ministries={ministries}
                departments={departments}
                onFilterChange={handleFilterChange}
                currentFilters={filters}
              />

              <Card>
                <CardContent className="p-0 overflow-hidden">
                  <TenderTable bids={bids} loading={loading} />
                </CardContent>
              </Card>

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
                <UserBidsTable bids={userBids} loading={userBidsLoading} />
              ) : (
                <Card>
                  <CardContent className="flex justify-center items-center h-32">
                    <p className="text-gray-500">Please log in to view your bids.</p>
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

// Prevent unnecessary re-renders
export default React.memo(DashboardPage);
