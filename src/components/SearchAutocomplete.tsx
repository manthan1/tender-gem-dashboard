import React, { useState, useRef, useEffect } from 'react';
import { Search, Clock, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';

interface SearchAutocompleteProps {
  onSubmit: (searchTerm: string) => void;
  className?: string;
}

const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({ onSubmit, className = '' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const trendingSearches = [
    'CCTV Tenders in Gujarat',
    'Construction Projects Mumbai',
    'IT Services Delhi',
    'Medical Equipment Tenders',
    'Road Construction Bihar',
    'Security Services Tender'
  ];

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Add to recent searches
      const newRecentSearches = [
        searchTerm.trim(),
        ...recentSearches.filter(item => item !== searchTerm.trim())
      ].slice(0, 5);
      
      setRecentSearches(newRecentSearches);
      localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
      
      onSubmit(searchTerm.trim());
      setIsOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setIsOpen(false);
    onSubmit(suggestion);
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative flex items-center bg-white rounded-2xl shadow-inner border border-gray-100 overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:ring-opacity-20 transition-all">
          <div className="pl-6 pr-4">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder="e.g. CCTV Tenders in Gujarat"
            className="flex-1 py-4 px-2 text-base focus:outline-none border-0 font-inter placeholder-muted-foreground"
          />
          <Button 
            type="submit"
            className="m-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium font-inter transition-colors"
          >
            Search
          </Button>
        </div>
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div 
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {recentSearches.length > 0 && (
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Recent Searches</span>
              </div>
              <div className="space-y-2">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(search)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium">Trending Searches</span>
            </div>
            <div className="space-y-2">
              {trendingSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(search)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;