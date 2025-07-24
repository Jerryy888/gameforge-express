import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
  Info,
  AlertCircle,
  Loader,
  RefreshCw,
  Play
} from "lucide-react";
import { gameAPI, type Game } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const GamePlay = () => {
  const { id } = useParams();
  const [game, setGame] = useState<Game | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGameLoading, setIsGameLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameError, setGameError] = useState(false);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      loadGameData(id);
    }
  }, [id]);

  useEffect(() => {
    // 监听全屏变化
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const loadGameData = async (gameId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const gameData = await gameAPI.getGame(gameId);
      setGame(gameData);

      // 增加播放计数
      try {
        await gameAPI.incrementPlayCount(gameData.id);
      } catch (err) {
        console.error('Failed to increment play count:', err);
      }
    } catch (err: any) {
      console.error('Failed to load game:', err);
      setError(err.message || 'Failed to load game data');
      
      if (err.status === 404) {
        setError('Game not found');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGameLoad = () => {
    setIsGameLoading(false);
    setGameError(false);
  };

  const handleGameError = () => {
    setIsGameLoading(false);
    setGameError(true);
  };

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
    if (iframeRef.current && game?.gameUrl) {
      setIsGameLoading(true);
      setGameError(false);
      iframeRef.current.src = game.gameUrl;
    }
  };

  const handleShare = async () => {
    if (!game) return;
    
    const url = window.location.href;
    const text = `Play ${game.title} - ${game.description}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: game.title,
          text,
          url
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link Copied",
          description: "Game link has been copied to clipboard!"
        });
      } catch (err) {
        console.error('Copy failed:', err);
        toast({
          title: "Share",
          description: "Share this game with your friends!",
          variant: "default"
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Loading Game...</h2>
          <p className="text-muted-foreground">Please wait while we prepare your game</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {error === 'Game not found' ? 'Game Not Found' : 'Loading Error'}
          </h1>
          <p className="text-muted-foreground mb-6 max-w-md">
            {error === 'Game not found' 
              ? "The game you're looking for doesn't exist or has been removed."
              : error
            }
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/games">
              <Button>Browse Games</Button>
            </Link>
            {error !== 'Game not found' && (
              <Button variant="outline" onClick={() => id && loadGameData(id)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again  
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!game) {
    return null;
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
              
              <Button variant="ghost" size="sm" onClick={handleShare}>
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
                {isGameLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-white text-lg font-semibold">Loading Game...</p>
                      <p className="text-white/70 text-sm mt-2">{game.title}</p>
                    </div>
                  </div>
                ) : gameError ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-destructive/20 to-muted/20">
                    <div className="text-center">
                      <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                      <p className="text-white text-lg font-semibold mb-2">Game Failed to Load</p>
                      <p className="text-white/70 text-sm mb-4">Unable to load the game. Please try again.</p>
                      <Button onClick={restartGame} variant="secondary">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                      </Button>
                    </div>
                  </div>
                ) : (
                  <iframe
                    ref={iframeRef}
                    src={game.gameUrl}
                    className="w-full h-full border-0"
                    allowFullScreen
                    title={game.title}
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    onLoad={handleGameLoad}
                    onError={handleGameError}
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
                      <Button variant="outline" size="sm" onClick={handleShare}>
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
                    
                    <Button variant="outline" className="w-full justify-start" onClick={handleShare}>
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