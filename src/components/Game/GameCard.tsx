import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Eye, Star } from "lucide-react";
import { Game } from "@/lib/api";

interface GameCardProps {
  game: Game;
  onPlayClick?: (gameId: number) => void;
}

const GameCard = ({ 
  game,
  onPlayClick
}: GameCardProps) => {
  const { 
    id, 
    title, 
    description, 
    thumbnail, 
    category, 
    playCount, 
    rating,
    isFeature,
    slug
  } = game;
  return (
    <Card className="group bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow overflow-hidden">
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={thumbnail || "/placeholder.svg"} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Link to={`/play/${slug || id}`} onClick={() => onPlayClick?.(id)}>
            <Button size="lg" className="bg-primary/90 hover:bg-primary text-primary-foreground shadow-glow">
              <Play className="h-5 w-5 mr-2" />
              Play Now
            </Button>
          </Link>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
          {isFeature && (
            <Badge className="bg-gradient-primary text-primary-foreground border-0">
              Featured
            </Badge>
          )}
          <Badge variant="secondary" className="bg-secondary/80 text-secondary-foreground">
            {category?.name || 'Uncategorized'}
          </Badge>
        </div>

        {/* Rating */}
        {rating && rating > 0 && (
          <div className="absolute top-3 right-3 flex items-center space-x-1 bg-black/60 rounded-full px-2 py-1">
            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
            <span className="text-xs text-white font-medium">{rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <Link to={`/game/${slug || id}`}>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {title}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {description}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Eye className="h-3 w-3" />
              <span>{playCount.toLocaleString()} plays</span>
            </div>
            
            <div className="flex space-x-2">
              <Link to={`/game/${slug || id}`}>
                <Button variant="outline" size="sm" className="text-xs">
                  Details
                </Button>
              </Link>
              <Link to={`/play/${slug || id}`} onClick={() => onPlayClick?.(id)}>
                <Button size="sm" className="text-xs">
                  <Play className="h-3 w-3 mr-1" />
                  Play
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameCard;