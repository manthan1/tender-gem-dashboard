
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  ministries: string[];
  departments: string[];
  onFilterChange: (filters: any) => void;
  currentFilters: any;
}

const FilterBar: React.FC<FilterBarProps> = ({
  ministries,
  departments,
  onFilterChange,
  currentFilters,
}) => {
  const [search, setSearch] = React.useState(currentFilters.search || "");
  const [ministry, setMinistry] = React.useState(currentFilters.ministry || "");
  const [department, setDepartment] = React.useState(currentFilters.department || "");
  const [dateFrom, setDateFrom] = React.useState<Date | null>(currentFilters.dateRange?.from || null);
  const [dateTo, setDateTo] = React.useState<Date | null>(currentFilters.dateRange?.to || null);

  const handleApplyFilters = () => {
    onFilterChange({
      search,
      ministry,
      department,
      dateRange: {
        from: dateFrom,
        to: dateTo,
      },
    });
  };

  const handleResetFilters = () => {
    setSearch("");
    setMinistry("");
    setDepartment("");
    setDateFrom(null);
    setDateTo(null);
    
    onFilterChange({
      search: "",
      ministry: "",
      department: "",
      dateRange: {
        from: null,
        to: null,
      },
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
        {/* Search input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <Input
            placeholder="Bid Number or Category"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Ministry filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ministry
          </label>
          <Select value={ministry} onValueChange={setMinistry}>
            <SelectTrigger>
              <SelectValue placeholder="All Ministries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ministries</SelectItem>
              {ministries.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Department filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department
          </label>
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger>
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date range filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From Date
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateFrom && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFrom ? format(dateFrom, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateFrom}
                onSelect={setDateFrom}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To Date
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateTo && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateTo ? format(dateTo, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateTo}
                onSelect={setDateTo}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={handleResetFilters}>
          Reset Filters
        </Button>
        <Button onClick={handleApplyFilters}>Apply Filters</Button>
      </div>
    </div>
  );
};

export default FilterBar;
