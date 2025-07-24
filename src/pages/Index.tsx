import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import GameGrid from "@/components/Game/GameGrid";
import AdBanner from "@/components/Layout/AdBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Game, Category, gameAPI, categoryAPI, handleApiError } from "@/lib/api";
import { 
  TrendingUp, 
  Clock, 
  Star, 
  Zap, 
  Grid3X3,
  ChevronRight,
  Play,
  Gamepad2,
  Users,
  Heart,
  Trophy
} from "lucide-react";

// Icon mapping for categories
const categoryIcons: Record<string, any> = {
  action: Zap,
  puzzle: Grid3X3,
  adventure: TrendingUp,
  arcade: Clock,
  racing: Trophy,
  strategy: Users,
  sports: Heart,
  rpg: Gamepad2,
  default: Gamepad2
};

// Color mapping for categories
const categoryColors: Record<string, string> = {
  action: "bg-red-500",
  puzzle: "bg-blue-500", 
  adventure: "bg-green-500",
  arcade: "bg-purple-500",
  racing: "bg-yellow-500",
  strategy: "bg-indigo-500",
  sports: "bg-pink-500",
  rpg: "bg-teal-500",
  default: "bg-gray-500"
};

const Index = () => {
  const [featuredGames, setFeaturedGames] = useState<Game[]>([]);
  const [popularGames, setPopularGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Load data in parallel
        const [categoriesData, featuredResponse, popularResponse] = await Promise.all([
          categoryAPI.getCategories(),
          gameAPI.getGames({ featured: true, limit: 3 }),
          gameAPI.getGames({ sort: 'popular', limit: 8 })
        ]);

        setCategories(categoriesData.slice(0, 4)); // Show only first 4 categories
        setFeaturedGames(featuredResponse.games);
        setPopularGames(popularResponse.games);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
        const errorInfo = handleApiError(err);
        setError(`Failed to load data: ${errorInfo.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="relative bg-gradient-primary rounded-2xl p-8 md:p-12 overflow-hidden">
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative z-10 text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                Play Amazing Games
                <span className="block text-accent"> For Free!</span>
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Discover thousands of free online games. No downloads required - play instantly in your browser!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/games">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                    <Play className="h-5 w-5 mr-2" />
                    Start Playing
                  </Button>
                </Link>
                <Link to="/games">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                    Browse Games
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Ad Banner */}
        <section className="mb-12 flex justify-center">
          <AdBanner size="large" position="content" />
        </section>

        {/* Error Message */}
        {error && (
          <section className="mb-8">
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          </section>
        )}

        {/* Categories */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Game Categories
            </h2>
            <Link to="/games">
              <Button variant="outline" className="group">
                View All
                <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {isLoading ? (
              // Loading skeleton for categories
              [...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4" />
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-3 bg-muted rounded w-16 mx-auto" />
                  </CardContent>
                </Card>
              ))
            ) : (
              categories.map((category) => {
                const Icon = categoryIcons[category.slug] || categoryIcons.default;
                const color = categoryColors[category.slug] || categoryColors.default;
                
                return (
                  <Link key={category.id} to={`/games?category=${category.slug}`}>
                    <Card className="group cursor-pointer hover:shadow-glow transition-all duration-300 border-border hover:border-primary/50">
                      <CardContent className="p-6 text-center">
                        <div className={`w-16 h-16 ${color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">{category.gameCount} games</p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })
            )}
          </div>
        </section>

        {/* Featured Games */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center">
              <Star className="h-6 w-6 text-primary mr-2" />
              Featured Games
            </h2>
            <Link to="/games?featured=true">
              <Button variant="outline" className="group">
                View All
                <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          
          <GameGrid games={featuredGames} loading={isLoading} />
        </section>

        {/* Sidebar Ad */}
        <div className="flex flex-col lg:flex-row gap-8 mb-12">
          <div className="flex-1">
            {/* Popular Games */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center">
                  <TrendingUp className="h-6 w-6 text-primary mr-2" />
                  Popular Games
                </h2>
                <Link to="/games?sort=popular">
                  <Button variant="outline" className="group">
                    View All
                    <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
              
              <GameGrid games={popularGames} loading={isLoading} />
            </section>
          </div>
          
          {/* Sidebar */}
          <aside className="lg:w-80 space-y-6">
            <AdBanner size="medium" position="sidebar" />
            
            {/* Recent Games */}
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center">
                  <Clock className="h-5 w-5 text-primary mr-2" />
                  Recently Added
                </h3>
                <div className="space-y-3">
                  {isLoading ? (
                    // Loading skeleton for recent games
                    [...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-3 animate-pulse">
                        <div className="w-12 h-12 bg-muted rounded-lg" />
                        <div className="flex-1">
                          <div className="h-4 bg-muted rounded mb-1" />
                          <div className="h-3 bg-muted rounded w-16" />
                        </div>
                        <div className="w-16 h-5 bg-muted rounded" />
                      </div>
                    ))
                  ) : (
                    featuredGames.slice(0, 3).map((game) => (
                      <Link key={game.id} to={`/game/${game.slug || game.id}`}>
                        <div className="flex items-center space-x-3 group cursor-pointer">
                          <img 
                            src={game.thumbnail || "/placeholder.svg"} 
                            alt={game.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors truncate">
                              {game.title}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {game.playCount.toLocaleString()} plays
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {game.category?.name || 'Game'}
                          </Badge>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
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

export default Index;
