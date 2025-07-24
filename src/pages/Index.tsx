import { useState, useEffect } from "react";
import { HomeSEO } from "@/components/SEO/SEO";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import GameGrid from "@/components/Game/GameGrid";
import AdBanner from "@/components/Layout/AdBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Clock, 
  Star, 
  Zap, 
  Grid3X3,
  ChevronRight,
  Play
} from "lucide-react";

// Mock data - Replace with API calls
const featuredGames = [
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
    rating: 4.6,
    isFeature: true
  },
  {
    id: 3,
    title: "Space Defender",
    description: "Defend Earth from alien invasion in this action-packed shooter",
    thumbnail: "/placeholder.svg",
    category: "Action",
    playCount: 156000,
    rating: 4.9,
    isFeature: true
  }
];

const popularGames = [
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
  {
    id: 6,
    title: "Word Challenge",
    description: "Test your vocabulary skills",
    thumbnail: "/placeholder.svg",
    category: "Puzzle",
    playCount: 92000,
    rating: 4.4
  },
  {
    id: 7,
    title: "Racing Thunder",
    description: "Fast-paced street racing",
    thumbnail: "/placeholder.svg",
    category: "Racing",
    playCount: 201000,
    rating: 4.6
  },
  {
    id: 8,
    title: "Strategy Empire",
    description: "Build your empire and conquer",
    thumbnail: "/placeholder.svg",
    category: "Strategy",
    playCount: 145000,
    rating: 4.8
  }
];

const categories = [
  { name: "Action", icon: Zap, count: 45, slug: "action", color: "bg-red-500" },
  { name: "Puzzle", icon: Grid3X3, count: 32, slug: "puzzle", color: "bg-blue-500" },
  { name: "Adventure", icon: TrendingUp, count: 28, slug: "adventure", color: "bg-green-500" },
  { name: "Arcade", icon: Clock, count: 52, slug: "arcade", color: "bg-purple-500" }
];

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <HomeSEO />
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
                <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                  <Play className="h-5 w-5 mr-2" />
                  Start Playing
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                  Browse Games
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Ad Banner */}
        <section className="mb-12 flex justify-center">
          <AdBanner size="large" position="content" />
        </section>

        {/* Categories */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Game Categories
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map(({ name, icon: Icon, count, slug, color }) => (
              <Card key={slug} className="group cursor-pointer hover:shadow-glow transition-all duration-300 border-border hover:border-primary/50">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 ${color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{name}</h3>
                  <p className="text-sm text-muted-foreground">{count} games</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Featured Games */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center">
              <Star className="h-6 w-6 text-primary mr-2" />
              Featured Games
            </h2>
            <Button variant="outline" className="group">
              View All
              <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
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
                <Button variant="outline" className="group">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
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
                  {featuredGames.slice(0, 3).map((game) => (
                    <div key={game.id} className="flex items-center space-x-3 group cursor-pointer">
                      <img 
                        src={game.thumbnail} 
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
                        {game.category}
                      </Badge>
                    </div>
                  ))}
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
