
import React, { useState, useCallback, useMemo } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import FilterBar from "@/components/FilterBar";
import TenderTable from "@/components/TenderTable";
import TablePagination from "@/components/TablePagination";
import { Card, CardContent } from "@/components/ui/card";
import { useGemBids, useFilterOptions } from "@/hooks/useGemBids";
import { useToast } from "@/hooks/use-toast";

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
  const [currentPage, setCurrentPage] = useState(1);
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

  // Initialize data fetching - we now have optimized this in the hook
  const { bids, totalPages, loading, error } = useGemBids(currentPage, processedFilters);
  
  // Optimized filter options with caching
  const { options: ministries, loading: ministriesLoading } = useFilterOptions("ministry");
  const { options: departments, loading: departmentsLoading } = useFilterOptions("department");

  // Handle filter changes - memoized for performance
  const handleFilterChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  // Handle page changes - memoized for performance
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Show error toast if API call fails
  React.useEffect(() => {
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
      <DashboardHeader />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
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
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
