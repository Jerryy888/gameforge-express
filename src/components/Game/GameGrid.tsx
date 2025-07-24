import GameCard from "./GameCard";
import { Game, gameAPI } from "@/lib/api";

interface GameGridProps {
  games: Game[];
  loading?: boolean;
  onGamePlay?: (gameId: number) => void;
}

const GameGrid = ({ games, loading = false, onGamePlay }: GameGridProps) => {
  const handlePlayClick = async (gameId: number): Promise<void> => {
    try {
      await gameAPI.incrementPlayCount(gameId);
      onGamePlay?.(gameId);
    } catch (error) {
      console.error('Failed to increment play count:', error);
      // Still allow play even if count increment fails
      onGamePlay?.(gameId);
    }
  };
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-lg overflow-hidden animate-pulse">
            <div className="aspect-video bg-muted" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-full" />
              <div className="h-3 bg-muted rounded w-2/3" />
              <div className="flex justify-between">
                <div className="h-6 bg-muted rounded w-16" />
                <div className="h-6 bg-muted rounded w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎮</div>
        <h3 className="text-xl font-semibold text-foreground mb-2">No Games Found</h3>
        <p className="text-muted-foreground">
          We couldn't find any games matching your criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {games.map((game) => (
        <GameCard 
          key={game.id} 
          game={game} 
          onPlayClick={handlePlayClick}
        />
      ))}
    </div>
  );
};

export default GameGrid;