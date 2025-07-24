import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AdBanner from "@/components/Layout/AdBanner";
import { 
  ArrowLeft, 
  Maximize, 
  Minimize, 
  RotateCcw, 
  Share2, 
  Heart,
  Home,
  Info
} from "lucide-react";

// Mock game data
const gameData = {
  1: {
    id: 1,
    title: "Cyber Racer 3D",
    gameUrl: "https://example.com/games/cyber-racer-3d", // This would be your game file URL
    category: "Racing",
    description: "High-speed futuristic racing with neon graphics",
    controls: [
      "Arrow Keys or WASD - Move",
      "Spacebar - Brake",
      "Shift - Boost",
      "R - Restart"
    ]
  }
};

const GamePlay = () => {
  const { id } = useParams();
  const [game, setGame] = useState(gameData[Number(id) as keyof typeof gameData]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const toggleFullscreen = () => {
    const gameContainer = document.getElementById('game-container');
    if (!document.fullscreenElement) {
      gameContainer?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const restartGame = () => {
    const iframe = document.getElementById('game-iframe') as HTMLIFrameElement;
    if (iframe) {
      const currentSrc = iframe.src;
      iframe.src = currentSrc; // Reload the iframe
    }
  };

  if (!game) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Game Not Found</h1>
          <Link to="/games">
            <Button>Browse Games</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Game Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-4">
              <Link to={`/game/${game.id}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              
              <div className="hidden md:flex items-center space-x-2">
                <h1 className="font-semibold text-foreground">{game.title}</h1>
                <span className="text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">{game.category}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={restartGame}>
                <RotateCcw className="h-4 w-4" />
                <span className="hidden md:inline ml-2">Restart</span>
              </Button>
              
              <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                <span className="hidden md:inline ml-2">
                  {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                </span>
              </Button>
              
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4" />
                <span className="hidden md:inline ml-2">Share</span>
              </Button>
              
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <Home className="h-4 w-4" />
                  <span className="hidden md:inline ml-2">Home</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Pre-Game Ad */}
      <div className="bg-muted/30 py-8">
        <div className="container mx-auto px-4 text-center">
          <AdBanner size="large" position="content" className="mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Advertisement - Game will start after this ad</p>
        </div>
      </div>

      {/* Game Container */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Game Area */}
            <div className="lg:col-span-3">
              <div 
                id="game-container"
                className="relative bg-black rounded-lg overflow-hidden aspect-video shadow-2xl"
              >
                {isLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-white text-lg font-semibold">Loading Game...</p>
                      <p className="text-white/70 text-sm mt-2">{game.title}</p>
                    </div>
                  </div>
                ) : (
                  <iframe
                    id="game-iframe"
                    src={game.gameUrl}
                    className="w-full h-full border-0"
                    allowFullScreen
                    title={game.title}
                    sandbox="allow-scripts allow-same-origin allow-forms"
                  />
                )}
              </div>

              {/* Game Controls Info */}
              <Card className="mt-6 bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground flex items-center">
                      <Info className="h-4 w-4 mr-2" />
                      Game Controls
                    </h3>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Heart className="h-4 w-4 mr-1" />
                        Like
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm text-foreground mb-2">Controls:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {game.controls.map((control, index) => (
                          <li key={index}>• {control}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-foreground mb-2">Description:</h4>
                      <p className="text-sm text-muted-foreground">{game.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1 space-y-6">
              <AdBanner size="medium" position="sidebar" />
              
              {/* Quick Actions */}
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Link to={`/game/${game.id}`} className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <Info className="h-4 w-4 mr-2" />
                        Game Details
                      </Button>
                    </Link>
                    
                    <Button variant="outline" className="w-full justify-start">
                      <Heart className="h-4 w-4 mr-2" />
                      Add to Favorites
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Game
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <AdBanner size="skyscraper" position="sidebar" />
            </aside>
          </div>
        </div>
      </main>

      {/* Footer Ad */}
      <footer className="bg-muted/30 py-6">
        <div className="container mx-auto px-4 text-center">
          <AdBanner size="large" position="footer" className="mx-auto" />
        </div>
      </footer>
    </div>
  );
};

export default GamePlay;