
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, X } from "lucide-react";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "./DateRangePicker";
import { useFilterOptions } from "@/hooks/useGemBids";
import CustomerKeywordFilter from "./CustomerKeywordFilter";

interface FilterBarProps {
  onFilterChange: (filters: {
    ministry?: string;
    department?: string;
    dateRange?: DateRange;
    search?: string;
    keywords?: string[];
  }) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ onFilterChange }) => {
  const [ministry, setMinistry] = useState<string>("");
  const [department, setDepartment] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [search, setSearch] = useState<string>("");
  const [keywords, setKeywords] = useState<string[]>([]);

  const { options: ministryOptions, loading: ministryLoading } = useFilterOptions("ministry");
  const { options: departmentOptions, loading: departmentLoading } = useFilterOptions("department");

  // Update filters when any value changes
  useEffect(() => {
    const filters: {
      ministry?: string;
      department?: string;
      dateRange?: DateRange;
      search?: string;
      keywords?: string[];
    } = {};

    if (ministry) filters.ministry = ministry;
    if (department) filters.department = department;
    if (dateRange) filters.dateRange = dateRange;
    if (search) filters.search = search;
    if (keywords.length > 0) filters.keywords = keywords;

    onFilterChange(filters);
  }, [ministry, department, dateRange, search, keywords, onFilterChange]);

  const handleClearFilters = () => {
    setMinistry("");
    setDepartment("");
    setDateRange(undefined);
    setSearch("");
    setKeywords([]);
  };

  const handleKeywordsChange = (newKeywords: string[]) => {
    setKeywords(newKeywords);
  };

  return (
    <div className="bg-card rounded-lg p-4 shadow-sm border">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search bids..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ministry">Ministry</Label>
            <select
              id="ministry"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={ministry}
              onChange={(e) => setMinistry(e.target.value)}
              disabled={ministryLoading}
            >
              <option value="">All Ministries</option>
              {ministryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <select
              id="department"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              disabled={departmentLoading}
            >
              <option value="">All Departments</option>
              {departmentOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Date Range</Label>
            <DateRangePicker
              date={dateRange}
              onDateChange={setDateRange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <CustomerKeywordFilter onKeywordsChange={handleKeywordsChange} />
          </div>
          
          <div className="md:col-span-2 flex justify-end items-end">
            <Button 
              variant="outline" 
              onClick={handleClearFilters}
              className="flex items-center gap-1"
            >
              <X className="h-4 w-4" /> Clear Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
