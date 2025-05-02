
import React, { useState, useEffect } from "react";
import { useCustomerKeywords, CustomerKeyword } from "@/hooks/useCustomerKeywords";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

interface CustomerKeywordFilterProps {
  onKeywordsChange: (keywords: string[]) => void;
}

const CustomerKeywordFilter: React.FC<CustomerKeywordFilterProps> = ({ onKeywordsChange }) => {
  const { customerKeywords, loading } = useCustomerKeywords();
  const [open, setOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerKeyword | null>(null);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  useEffect(() => {
    if (selectedCustomer) {
      setSelectedKeywords(selectedCustomer.keywords);
      onKeywordsChange(selectedCustomer.keywords);
    } else {
      setSelectedKeywords([]);
      onKeywordsChange([]);
    }
  }, [selectedCustomer, onKeywordsChange]);

  const toggleKeyword = (keyword: string) => {
    setSelectedKeywords(current => {
      const isSelected = current.includes(keyword);
      const newKeywords = isSelected
        ? current.filter(k => k !== keyword)
        : [...current, keyword];
      
      onKeywordsChange(newKeywords);
      return newKeywords;
    });
  };

  if (loading || customerKeywords.length === 0) return null;

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">Filter by Customer</label>
        {selectedCustomer && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setSelectedCustomer(null);
              setSelectedKeywords([]);
              onKeywordsChange([]);
            }}
          >
            Clear
          </Button>
        )}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between"
          >
            {selectedCustomer ? selectedCustomer.customer_name : "Select customer..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Search customer..." />
            <CommandEmpty>No customer found.</CommandEmpty>
            <CommandGroup>
              {customerKeywords.map((customer) => (
                <CommandItem
                  key={customer.id}
                  value={customer.customer_name}
                  onSelect={() => {
                    setSelectedCustomer(
                      selectedCustomer?.id === customer.id ? null : customer
                    );
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedCustomer?.id === customer.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {customer.customer_name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedCustomer && selectedCustomer.keywords.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Keywords</label>
          <div className="space-y-2">
            {selectedCustomer.keywords.map((keyword) => (
              <div key={keyword} className="flex items-center space-x-2">
                <Checkbox
                  id={`keyword-${keyword}`}
                  checked={selectedKeywords.includes(keyword)}
                  onCheckedChange={() => toggleKeyword(keyword)}
                />
                <label
                  htmlFor={`keyword-${keyword}`}
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {keyword}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerKeywordFilter;
