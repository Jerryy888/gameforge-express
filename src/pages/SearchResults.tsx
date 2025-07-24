import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import GameGrid from "@/components/Game/GameGrid";
import AdBanner from "@/components/Layout/AdBanner";
import { AdvancedSearch } from "@/components/Search/SearchComponents";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Search as SearchIcon, 
  Filter, 
  Clock,
  TrendingUp,
  Star
} from "lucide-react";
import { searchAPI, gameAPI } from "@/lib/api";

interface SearchFilters {
  query: string;
  category?: string;
  minRating?: number;
  maxRating?: number;
  sortBy?: string;
  dateRange?: string;
  featured?: boolean;
}

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [searchTime, setSearchTime] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const sortBy = searchParams.get('sort') || 'relevance';

  const initialFilters: SearchFilters = {
    query,
    category: category || undefined,
    sortBy,
    minRating: 0,
    maxRating: 5,
    dateRange: 'all',
    featured: false
  };

  useEffect(() => {
    if (query) {
      performSearch(initialFilters);
    }
    
    // 获取推荐数据
    loadSuggestions();
  }, [query, category, sortBy]);

  useEffect(() => {
    // 获取最近搜索
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    setRecentSearches(recent.slice(0, 5));
  }, []);

  const performSearch = async (filters: SearchFilters) => {
    if (!filters.query.trim()) return;

    setIsLoading(true);
    const startTime = Date.now();

    try {
      const result = await searchAPI.searchGames(filters.query, {
        category: filters.category,
        minRating: filters.minRating,
        sortBy: filters.sortBy
      });

      setSearchResults(result.games);
      setTotalResults(result.total);
      setSuggestions(result.suggestions || []);
      setSearchTime(Date.now() - startTime);

      // 保存搜索记录
      saveSearchHistory(filters.query);

    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSuggestions = async () => {
    try {
      const trending = await searchAPI.getTrendingSearches();
      setTrendingSearches(trending);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    }
  };

  const saveSearchHistory = (searchQuery: string) => {
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    const updated = [
      searchQuery,
      ...recent.filter((item: string) => item !== searchQuery)
    ].slice(0, 10);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
    setRecentSearches(updated.slice(0, 5));
  };

  const handleSearch = (filters: SearchFilters) => {
    const params = new URLSearchParams();
    if (filters.query) params.set('q', filters.query);
    if (filters.category) params.set('category', filters.category);
    if (filters.sortBy && filters.sortBy !== 'relevance') params.set('sort', filters.sortBy);
    
    setSearchParams(params);
    performSearch(filters);
  };

  const handleSuggestionClick = (suggestion: string) => {
    const newFilters = { ...initialFilters, query: suggestion };
    handleSearch(newFilters);
  };

  const clearSearch = () => {
    setSearchParams({});
    setSearchResults([]);
    setTotalResults(0);
    setSuggestions([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <SearchIcon className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Search Results</h1>
          </div>
          
          {query && (
            <div className="mb-4">
              <p className="text-muted-foreground">
                {isLoading ? 'Searching...' : `${totalResults.toLocaleString()} results found for "${query}" in ${searchTime}ms`}
              </p>
            </div>
          )}
        </div>

        {/* Advanced Search */}
        <div className="mb-8">
          <AdvancedSearch 
            onSearch={handleSearch}
            initialFilters={initialFilters}
          />
        </div>

        {/* Ad Banner */}
        <div className="mb-8 flex justify-center">
          <AdBanner size="large" position="content" />
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Results */}
          <div className="lg:col-span-3">
            {!query ? (
              /* No Search Query - Show Suggestions */
              <div className="space-y-8">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <SearchIcon className="h-5 w-5 mr-2" />
                      Start Your Search
                    </CardTitle>
                    <CardDescription>
                      Enter a game name or browse our suggestions below
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Recent Searches */}
                    {recentSearches.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-foreground mb-3 flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          Recent Searches
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {recentSearches.map((search, index) => (
                            <Badge 
                              key={index}
                              variant="secondary" 
                              className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                              onClick={() => handleSuggestionClick(search)}
                            >
                              {search}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Trending Searches */}
                    {trendingSearches.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-foreground mb-3 flex items-center">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Trending Searches
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {trendingSearches.map((search, index) => (
                            <Badge 
                              key={index}
                              variant="outline" 
                              className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                              onClick={() => handleSuggestionClick(search)}
                            >
                              {search}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Popular Categories */}
                    <div>
                      <h3 className="font-semibold text-foreground mb-3">
                        Browse by Category
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {['Action', 'Puzzle', 'Racing', 'Adventure', 'Arcade', 'Strategy'].map((cat) => (
                          <Button
                            key={cat}
                            variant="outline"
                            onClick={() => handleSearch({ ...initialFilters, category: cat, query: cat })}
                            className="justify-start"
                          >
                            {cat}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              /* Search Results */
              <div className="space-y-6">
                {/* Search Suggestions */}
                {suggestions.length > 0 && (
                  <Card className="bg-card border-border">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground mb-2">Did you mean:</p>
                      <div className="flex flex-wrap gap-2">
                        {suggestions.map((suggestion, index) => (
                          <Badge 
                            key={index}
                            variant="outline" 
                            className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Results */}
                <GameGrid games={searchResults} loading={isLoading} />

                {/* No Results */}
                {!isLoading && searchResults.length === 0 && query && (
                  <Card className="bg-card border-border">
                    <CardContent className="p-8 text-center">
                      <SearchIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        No games found
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        We couldn't find any games matching "{query}". Try adjusting your search terms or browse our categories.
                      </p>
                      <div className="space-y-4">
                        <Button onClick={clearSearch} variant="outline">
                          Clear Search
                        </Button>
                        
                        {suggestions.length > 0 && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">
                              Try these suggestions:
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center">
                              {suggestions.slice(0, 3).map((suggestion, index) => (
                                <Badge 
                                  key={index}
                                  variant="secondary" 
                                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                                  onClick={() => handleSuggestionClick(suggestion)}
                                >
                                  {suggestion}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            <AdBanner size="medium" position="sidebar" />
            
            {/* Featured Games */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <Star className="h-4 w-4 mr-2" />
                  Featured Games
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[1,2,3].map((i) => (
                  <div key={i} className="flex items-center space-x-3 group cursor-pointer">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      🎮
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                        Featured Game {i}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Action • 4.8★
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <AdBanner size="skyscraper" position="sidebar" />
          </aside>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SearchResults;