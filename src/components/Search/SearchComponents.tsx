import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  X, 
  Clock, 
  TrendingUp,
  Filter,
  SlidersHorizontal
} from "lucide-react";
import { searchAPI, gameAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface SearchBarProps {
  placeholder?: string;
  showSuggestions?: boolean;
  className?: string;
  onSearch?: (query: string) => void;
}

export const SearchBar = ({ 
  placeholder = "Search games...", 
  showSuggestions = true, 
  className = "",
  onSearch 
}: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
  
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // 获取最近搜索记录
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    setRecentSearches(recent.slice(0, 5));

    // 获取热门搜索
    searchAPI.getTrendingSearches()
      .then(setSuggestions)
      .catch(console.error);
  }, []);

  useEffect(() => {
    // 点击外部关闭建议列表
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestionsList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (searchQuery: string) => {
    if (!searchQuery.trim() || !showSuggestions) return;

    setIsLoading(true);
    try {
      const suggestions = await searchAPI.getSuggestions(searchQuery);
      setSuggestions(suggestions);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    
    // 防抖处理
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  const handleSearch = (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    // 保存到最近搜索
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    const updatedRecent = [
      searchQuery,
      ...recent.filter((item: string) => item !== searchQuery)
    ].slice(0, 10);
    localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));

    // 关闭建议列表
    setShowSuggestionsList(false);
    
    // 调用回调或导航
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestionsList(false);
      inputRef.current?.blur();
    }
  };

  const clearSearch = () => {
    setQuery("");
    setSuggestions([]);
    setShowSuggestionsList(false);
    inputRef.current?.focus();
  };

  const clearRecentSearches = () => {
    localStorage.removeItem('recentSearches');
    setRecentSearches([]);
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestionsList(true)}
          className="pl-10 pr-10"
        />
        
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* 搜索建议列表 */}
      {showSuggestionsList && showSuggestions && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 bg-background border-border shadow-lg max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {/* 最近搜索 */}
            {recentSearches.length > 0 && !query && (
              <div className="p-3 border-b border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Recent Searches
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearRecentSearches}
                    className="text-xs"
                  >
                    Clear
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {recentSearches.map((search, index) => (
                    <Badge 
                      key={index}
                      variant="secondary" 
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => handleSearch(search)}
                    >
                      {search}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* 热门搜索 */}
            {!query && trendingSearches.length > 0 && (
              <div className="p-3 border-b border-border">
                <span className="text-sm font-medium text-foreground flex items-center mb-2">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Trending
                </span>
                <div className="flex flex-wrap gap-1">
                  {trendingSearches.map((search, index) => (
                    <Badge 
                      key={index}
                      variant="outline" 
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => handleSearch(search)}
                    >
                      {search}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* 搜索建议 */}
            {query && suggestions.length > 0 && (
              <div className="py-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(suggestion)}
                    className="w-full px-3 py-2 text-left hover:bg-muted transition-colors text-sm text-foreground"
                  >
                    <Search className="h-3 w-3 mr-2 inline text-muted-foreground" />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* 加载状态 */}
            {isLoading && (
              <div className="p-3 text-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto"></div>
              </div>
            )}

            {/* 无结果 */}
            {query && !isLoading && suggestions.length === 0 && (
              <div className="p-3 text-center text-sm text-muted-foreground">
                No suggestions found
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// 高级搜索组件
interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
}

interface SearchFilters {
  query: string;
  category?: string;
  minRating?: number;
  maxRating?: number;
  sortBy?: string;
  dateRange?: string;
  featured?: boolean;
}

export const AdvancedSearch = ({ onSearch, initialFilters }: AdvancedSearchProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(
    initialFilters || {
      query: "",
      category: "",
      minRating: 0,
      maxRating: 5,
      sortBy: "relevance",
      dateRange: "all",
      featured: false
    }
  );

  const categories = ["Action", "Puzzle", "Racing", "Adventure", "Arcade", "Strategy"];
  const sortOptions = [
    { value: "relevance", label: "Relevance" },
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "popular", label: "Most Popular" },
    { value: "rating", label: "Highest Rated" },
    { value: "name", label: "Name A-Z" }
  ];

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    onSearch(filters);
    setIsOpen(false);
  };

  const clearFilters = () => {
    setFilters({
      query: "",
      category: "",
      minRating: 0,
      maxRating: 5,
      sortBy: "relevance",
      dateRange: "all",
      featured: false
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <SearchBar 
          placeholder="Search games..." 
          onSearch={(query) => handleFilterChange('query', query)}
          className="flex-1"
        />
        
        <Button 
          variant="outline" 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {isOpen && (
        <Card className="bg-card border-border">
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select 
                  value={filters.category || ""} 
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Sort By</label>
                <select 
                  value={filters.sortBy || "relevance"} 
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Added</label>
                <select 
                  value={filters.dateRange || "all"} 
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>
            </div>

            {/* Rating Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Rating Range</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  max={5}
                  step={0.1}
                  value={filters.minRating || 0}
                  onChange={(e) => handleFilterChange('minRating', parseFloat(e.target.value))}
                  className="w-20"
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="number"
                  min={0}
                  max={5}
                  step={0.1}
                  value={filters.maxRating || 5}
                  onChange={(e) => handleFilterChange('maxRating', parseFloat(e.target.value))}
                  className="w-20"
                />
                <span className="text-muted-foreground">stars</span>
              </div>
            </div>

            {/* Featured Only */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="featured"
                checked={filters.featured || false}
                onChange={(e) => handleFilterChange('featured', e.target.checked)}
                className="rounded border-border"
              />
              <label htmlFor="featured" className="text-sm font-medium">
                Featured games only
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t border-border">
              <Button onClick={handleSearch} className="flex-1">
                <Search className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
              
              <Button variant="outline" onClick={clearFilters}>
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};