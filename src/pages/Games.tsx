import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import GameGrid from "@/components/Game/GameGrid";
import AdBanner from "@/components/Layout/AdBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List,
  SlidersHorizontal
} from "lucide-react";

// Mock data - same as Index page
const allGames = [
  {
    id: 1,
    title: "Cyber Racer 3D",
    description: "High-speed futuristic racing with neon graphics and electronic music",
    thumbnail: "/placeholder.svg",
    category: "Racing",
    playCount: 125000,
    rating: 4.8,
    isFeature: true
  },
  {
    id: 2,
    title: "Puzzle Master",
    description: "Mind-bending puzzles that will challenge your logic and creativity",
    thumbnail: "/placeholder.svg",
    category: "Puzzle",
    playCount: 89000,
    rating: 4.6
  },
  {
    id: 3,
    title: "Space Defender",
    description: "Defend Earth from alien invasion in this action-packed shooter",
    thumbnail: "/placeholder.svg",
    category: "Action",
    playCount: 156000,
    rating: 4.9
  },
  {
    id: 4,
    title: "Block Breaker",
    description: "Classic arcade game with modern graphics",
    thumbnail: "/placeholder.svg",
    category: "Arcade",
    playCount: 234000,
    rating: 4.7
  },
  {
    id: 5,
    title: "Adventure Quest",
    description: "Epic adventure in mystical lands",
    thumbnail: "/placeholder.svg",
    category: "Adventure",
    playCount: 178000,
    rating: 4.5
  },
  // Add more games...
];

const categories = ["All", "Action", "Puzzle", "Adventure", "Racing", "Arcade", "Strategy"];
const sortOptions = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Highest Rated" },
  { value: "name", label: "A-Z" }
];

const Games = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [games, setGames] = useState(allGames);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Filter and sort games
    let filteredGames = [...allGames];

    // Filter by search query
    if (searchQuery) {
      filteredGames = filteredGames.filter(game =>
        game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "All") {
      filteredGames = filteredGames.filter(game => game.category === selectedCategory);
    }

    // Sort games
    switch (sortBy) {
      case "popular":
        filteredGames.sort((a, b) => b.playCount - a.playCount);
        break;
      case "newest":
        filteredGames.sort((a, b) => b.id - a.id);
        break;
      case "rating":
        filteredGames.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "name":
        filteredGames.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    setGames(filteredGames);

    // Update URL params
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedCategory !== "All") params.set("category", selectedCategory);
    if (sortBy !== "popular") params.set("sort", sortBy);
    setSearchParams(params);
  }, [searchQuery, selectedCategory, sortBy, setSearchParams]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            All Games
          </h1>
          <p className="text-muted-foreground">
            Discover amazing games from our collection of {allGames.length}+ titles
          </p>
        </div>

        {/* Ad Banner */}
        <div className="mb-8 flex justify-center">
          <AdBanner size="large" position="content" />
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className={`${showFilters ? "block" : "hidden"} md:block`}>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Filters:</span>
                  </div>
                  
                  {/* Category Filter */}
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Badge
                        key={category}
                        variant={selectedCategory === category ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-sm text-muted-foreground">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-background border border-border rounded-md px-3 py-1 text-sm"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Results */}
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {isLoading ? "Loading..." : `${games.length} games found`}
              </p>
            </div>
            
            <GameGrid games={games} loading={isLoading} />
          </div>
          
          {/* Sidebar Ads */}
          <aside className="lg:w-80 space-y-6">
            <AdBanner size="medium" position="sidebar" />
            <AdBanner size="skyscraper" position="sidebar" />
          </aside>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Games;