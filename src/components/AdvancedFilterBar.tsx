
import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown, X, Filter, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

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

interface FilterBarProps {
  ministries: string[];
  departments: string[];
  cities: string[];
  onFilterChange: (filters: any) => void;
  currentFilters: Filters;
  totalResults: number;
}

interface MultiSelectState {
  [key: string]: string[];
}

const AdvancedFilterBar: React.FC<FilterBarProps> = ({
  ministries,
  departments,
  cities,
  onFilterChange,
  currentFilters,
  totalResults,
}) => {
  const [search, setSearch] = useState(currentFilters.search || "");
  const [selectedMinistries, setSelectedMinistries] = useState<string[]>(
    currentFilters.ministry ? [currentFilters.ministry] : []
  );
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>(
    currentFilters.department ? [currentFilters.department] : []
  );
  const [selectedCities, setSelectedCities] = useState<string[]>(
    currentFilters.city ? [currentFilters.city] : []
  );
  const [dateFrom, setDateFrom] = useState<Date | null>(currentFilters.dateRange?.from || null);
  const [dateTo, setDateTo] = useState<Date | null>(currentFilters.dateRange?.to || null);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const searchDebounceRef = useRef<number | null>(null);

  // Handle search input with debounce
  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    
    // Only trigger search when user stops typing (300ms debounce)
    if (search !== currentFilters.search) {
      searchDebounceRef.current = window.setTimeout(() => {
        applyFilters();
        searchDebounceRef.current = null;
      }, 300);
    }
    
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [search]);

  const applyFilters = () => {
    // Clear any pending search debounce
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = null;
    }
    
    onFilterChange({
      ...currentFilters,
      search,
      ministry: selectedMinistries.length > 0 ? selectedMinistries[0] : "",
      department: selectedDepartments.length > 0 ? selectedDepartments[0] : "",
      city: selectedCities.length > 0 ? selectedCities[0] : "",
      dateRange: {
        from: dateFrom,
        to: dateTo,
      },
    });
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedMinistries([]);
    setSelectedDepartments([]);
    setSelectedCities([]);
    setDateFrom(null);
    setDateTo(null);
    
    // Clear any pending search debounce
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = null;
    }
    
    onFilterChange({
      ...currentFilters,
      search: "",
      ministry: "",
      department: "",
      city: "",
      dateRange: {
        from: null,
        to: null,
      },
    });
  };

  // Multi-select handlers
  const handleMultiSelectChange = (
    value: string,
    currentSelection: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const newSelection = currentSelection.includes(value)
      ? currentSelection.filter(item => item !== value)
      : [...currentSelection, value];
    setter(newSelection);
    
    // Apply filters immediately for non-search changes
    setTimeout(applyFilters, 0);
  };

  const removeFilter = (type: string, value: string) => {
    switch (type) {
      case 'ministry':
        setSelectedMinistries(prev => prev.filter(item => item !== value));
        break;
      case 'department':
        setSelectedDepartments(prev => prev.filter(item => item !== value));
        break;
      case 'city':
        setSelectedCities(prev => prev.filter(item => item !== value));
        break;
    }
    setTimeout(applyFilters, 0);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (search) count++;
    if (selectedMinistries.length > 0) count++;
    if (selectedDepartments.length > 0) count++;
    if (selectedCities.length > 0) count++;
    if (dateFrom || dateTo) count++;
    return count;
  };

  const MultiSelectDropdown = ({
    options,
    selected,
    onSelectionChange,
    placeholder,
    label
  }: {
    options: string[];
    selected: string[];
    onSelectionChange: (value: string, current: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => void;
    placeholder: string;
    label: string;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between text-left font-normal"
          >
            <span className="truncate">
              {selected.length === 0 
                ? placeholder 
                : selected.length === 1 
                ? selected[0] 
                : `${selected.length} selected`
              }
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-2" align="start">
          <div className="max-h-60 overflow-y-auto">
            {options.map((option) => (
              <div key={option} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                <Checkbox
                  checked={selected.includes(option)}
                  onCheckedChange={() => onSelectionChange(option, selected, 
                    label === 'Ministry' ? setSelectedMinistries :
                    label === 'Department' ? setSelectedDepartments : setSelectedCities
                  )}
                />
                <span className="text-sm">{option}</span>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFilterCount()} active
              </Badge>
            )}
          </CardTitle>
          <div className="text-sm text-gray-600">
            Showing {totalResults.toLocaleString()} results
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Global Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search bid number, category, ministry, department, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Active Filter Chips */}
        {getActiveFilterCount() > 0 && (
          <div className="flex flex-wrap gap-2">
            {search && (
              <Badge variant="outline" className="flex items-center gap-1">
                Search: {search}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => setSearch("")} 
                />
              </Badge>
            )}
            {selectedMinistries.map(ministry => (
              <Badge key={ministry} variant="outline" className="flex items-center gap-1">
                Ministry: {ministry}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeFilter('ministry', ministry)} 
                />
              </Badge>
            ))}
            {selectedDepartments.map(department => (
              <Badge key={department} variant="outline" className="flex items-center gap-1">
                Department: {department}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeFilter('department', department)} 
                />
              </Badge>
            ))}
            {selectedCities.map(city => (
              <Badge key={city} variant="outline" className="flex items-center gap-1">
                City: {city}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeFilter('city', city)} 
                />
              </Badge>
            ))}
            {(dateFrom || dateTo) && (
              <Badge variant="outline" className="flex items-center gap-1">
                Date: {dateFrom ? format(dateFrom, "MMM dd") : "Start"} - {dateTo ? format(dateTo, "MMM dd") : "End"}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => { setDateFrom(null); setDateTo(null); }} 
                />
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={handleResetFilters}>
              Clear All
            </Button>
          </div>
        )}

        {/* Advanced Filters */}
        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between">
              Advanced Filters
              <ChevronDown className={cn("h-4 w-4 transition-transform", isAdvancedOpen && "rotate-180")} />
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Multi-select dropdowns */}
              <MultiSelectDropdown
                options={ministries}
                selected={selectedMinistries}
                onSelectionChange={handleMultiSelectChange}
                placeholder="All Ministries"
                label="Ministry"
              />
              
              <MultiSelectDropdown
                options={departments}
                selected={selectedDepartments}
                onSelectionChange={handleMultiSelectChange}
                placeholder="All Departments"
                label="Department"
              />
              
              <MultiSelectDropdown
                options={cities}
                selected={selectedCities}
                onSelectionChange={handleMultiSelectChange}
                placeholder="All Cities"
                label="City"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <div className="space-y-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateFrom && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFrom ? format(dateFrom, "PPP") : <span>From date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateFrom}
                        onSelect={setDateFrom}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateTo && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateTo ? format(dateTo, "PPP") : <span>To date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateTo}
                        onSelect={setDateTo}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={handleResetFilters}>
                Reset All Filters
              </Button>
              <Button onClick={applyFilters}>Apply Filters</Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default React.memo(AdvancedFilterBar);
