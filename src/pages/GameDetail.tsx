import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import GameGrid from "@/components/Game/GameGrid";
import AdBanner from "@/components/Layout/AdBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Play, 
  Heart, 
  Share2, 
  Star, 
  Eye, 
  ChevronLeft,
  Calendar,
  User,
  Gamepad2
} from "lucide-react";

// Mock game data
const gameData = {
  1: {
    id: 1,
    title: "Cyber Racer 3D",
    description: "High-speed futuristic racing with neon graphics and electronic music. Experience the thrill of racing in a cyberpunk world with stunning visual effects.",
    longDescription: `
      Get ready for the ultimate racing experience in Cyber Racer 3D! This high-octane racing game combines futuristic vehicles with stunning neon-lit tracks that will keep you on the edge of your seat.

      **Key Features:**
      • Futuristic racing vehicles with unique designs
      • Neon-lit tracks with dynamic lighting effects
      • Multiple game modes including Time Trial and Championship
      • Upgrade system for enhanced performance
      • Electronic soundtrack that matches the cyberpunk atmosphere
      
      **How to Play:**
      • Use arrow keys or WASD to control your vehicle
      • Collect power-ups to gain advantages
      • Avoid obstacles and other racers
      • Complete laps in the fastest time possible
      
      Navigate through the glowing cityscape, dodge obstacles, and compete against AI opponents in this thrilling racing adventure. The game features multiple tracks, each with its own unique challenges and visual style.
    `,
    thumbnail: "/placeholder.svg",
    screenshots: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    category: "Racing",
    tags: ["Racing", "3D", "Futuristic", "Neon", "Fast-paced"],
    playCount: 125000,
    rating: 4.8,
    reviews: 1250,
    releaseDate: "2024-01-15",
    developer: "NeonGames Studio",
    fileSize: "15.2 MB",
    isFeature: true
  }
};

const relatedGames = [
  {
    id: 2,
    title: "Space Defender",
    description: "Defend Earth from alien invasion",
    thumbnail: "/placeholder.svg",
    category: "Action",
    playCount: 156000,
    rating: 4.9
  },
  {
    id: 3,
    title: "Puzzle Master",
    description: "Mind-bending puzzles",
    thumbnail: "/placeholder.svg",
    category: "Puzzle",
    playCount: 89000,
    rating: 4.6
  },
  {
    id: 4,
    title: "Block Breaker",
    description: "Classic arcade game",
    thumbnail: "/placeholder.svg",
    category: "Arcade",
    playCount: 234000,
    rating: 4.7
  }
];

const GameDetail = () => {
  const { id } = useParams();
  const [game, setGame] = useState(gameData[Number(id) as keyof typeof gameData]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeScreenshot, setActiveScreenshot] = useState(0);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="aspect-video bg-muted rounded" />
              <div className="space-y-4">
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-4">Game Not Found</h1>
            <p className="text-muted-foreground mb-6">The game you're looking for doesn't exist.</p>
            <Link to="/games">
              <Button>Browse All Games</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/games" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Games
          </Link>
        </div>

        {/* Game Header */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Screenshots */}
          <div className="space-y-4">
            <div className="aspect-video overflow-hidden rounded-lg border border-border bg-card">
              <img 
                src={game.screenshots?.[activeScreenshot] || game.thumbnail} 
                alt={game.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {game.screenshots && game.screenshots.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {game.screenshots.map((screenshot, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveScreenshot(index)}
                    className={`flex-shrink-0 w-20 h-12 rounded border-2 overflow-hidden ${
                      activeScreenshot === index ? "border-primary" : "border-border"
                    }`}
                  >
                    <img 
                      src={screenshot} 
                      alt={`Screenshot ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Game Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold text-foreground">{game.title}</h1>
                {game.isFeature && (
                  <Badge className="bg-gradient-primary text-primary-foreground">
                    Featured
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                  <span className="font-medium">{game.rating}</span>
                  <span className="text-muted-foreground ml-1">({game.reviews} reviews)</span>
                </div>
                
                <div className="flex items-center text-muted-foreground">
                  <Eye className="h-4 w-4 mr-1" />
                  <span>{game.playCount.toLocaleString()} plays</span>
                </div>
              </div>

              <p className="text-muted-foreground mb-4">{game.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="secondary">{game.category}</Badge>
                {game.tags?.map((tag) => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Link to={`/play/${game.id}`} className="flex-1">
                <Button size="lg" className="w-full">
                  <Play className="h-5 w-5 mr-2" />
                  Play Now
                </Button>
              </Link>
              
              <Button variant="outline" size="lg">
                <Heart className="h-5 w-5" />
              </Button>
              
              <Button variant="outline" size="lg">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Game Details */}
            <Card className="bg-card border-border">
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold text-foreground mb-3">Game Details</h3>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Released:</span>
                    <span>{new Date(game.releaseDate).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Developer:</span>
                    <span>{game.developer}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Gamepad2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Category:</span>
                    <span>{game.category}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Size:</span>
                    <span>{game.fileSize}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Ad Banner */}
        <div className="mb-8 flex justify-center">
          <AdBanner size="large" position="content" />
        </div>

        {/* Game Description */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">About This Game</h2>
                <div className="prose prose-invert max-w-none">
                  {game.longDescription.split('\n').map((paragraph, index) => (
                    <p key={index} className="text-muted-foreground mb-3">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <AdBanner size="medium" position="sidebar" />
          </div>
        </div>

        <Separator className="my-8" />

        {/* Related Games */}
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-6">Related Games</h2>
          <GameGrid games={relatedGames} />
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default GameDetail;