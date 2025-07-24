import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
  Gamepad2,
  AlertCircle,
  Clock,
  Download
} from "lucide-react";
import { gameAPI, type Game } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";


const GameDetail = () => {
  const { id } = useParams();
  const [game, setGame] = useState<Game | null>(null);
  const [relatedGames, setRelatedGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeScreenshot, setActiveScreenshot] = useState(0);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      loadGameData(id);
    }
  }, [id]);

  const loadGameData = async (gameId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // 并行加载游戏详情和相关游戏
      const [gameData, relatedGamesData] = await Promise.all([
        gameAPI.getGame(gameId),
        gameAPI.getRelatedGames(parseInt(gameId), 4).catch(() => [])
      ]);

      setGame(gameData);
      setRelatedGames(relatedGamesData);
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

  const handlePlay = async () => {
    if (!game) return;
    
    try {
      // 增加播放计数
      await gameAPI.incrementPlayCount(game.id);
      
      // 跳转到游戏播放页面
      navigate(`/play/${game.id}`);
    } catch (err) {
      console.error('Failed to increment play count:', err);
      // 即使计数失败也继续跳转
      navigate(`/play/${game.id}`);
    }
  };

  const handleShare = async () => {
    if (!game) return;
    
    const url = window.location.href;
    const text = `Check out ${game.title} - ${game.description}`;
    
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
      // 后备方案：复制到剪贴板
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

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-16 w-16 text-destructive mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-4">
              {error === 'Game not found' ? 'Game Not Found' : 'Loading Error'}
            </h1>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              {error === 'Game not found' 
                ? "The game you're looking for doesn't exist or has been removed."
                : error
              }
            </p>
            <div className="flex gap-3">
              <Link to="/games">
                <Button>Browse All Games</Button>
              </Link>
              {error !== 'Game not found' && (
                <Button variant="outline" onClick={() => id && loadGameData(id)}>
                  Try Again
                </Button>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!game) {
    return null;
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
                  <span className="font-medium">{game.rating || 'N/A'}</span>
                  <span className="text-muted-foreground ml-1">
                    ({game.reviewCount || 0} reviews)
                  </span>
                </div>
                
                <div className="flex items-center text-muted-foreground">
                  <Eye className="h-4 w-4 mr-1" />
                  <span>{game.playCount.toLocaleString()} plays</span>
                </div>
              </div>

              <p className="text-muted-foreground mb-4">{game.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="secondary">{game.category?.name || 'Uncategorized'}</Badge>
                {game.tags?.map((tag) => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button size="lg" className="flex-1" onClick={handlePlay}>
                <Play className="h-5 w-5 mr-2" />
                Play Now
              </Button>
              
              <Button variant="outline" size="lg">
                <Heart className="h-5 w-5" />
              </Button>
              
              <Button variant="outline" size="lg" onClick={handleShare}>
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
                    <span>{new Date(game.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Developer:</span>
                    <span>{game.developer || 'Unknown'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Gamepad2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Category:</span>
                    <span>{game.category?.name || 'Uncategorized'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Size:</span>
                    <span>{game.fileSize || 'Unknown'}</span>
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
                  {game.longDescription ? (
                    game.longDescription.split('\n').map((paragraph, index) => (
                      <p key={index} className="text-muted-foreground mb-3">
                        {paragraph}
                      </p>
                    ))
                  ) : (
                    <p className="text-muted-foreground">
                      {game.description}
                    </p>
                  )}
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