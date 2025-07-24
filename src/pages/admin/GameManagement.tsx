import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Upload, 
  Eye,
  Star,
  Filter,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type Game } from "@/lib/api";

// Mock data
const mockGames = [
  {
    id: 1,
    title: "Cyber Racer 3D",
    category: "Racing",
    description: "High-speed futuristic racing game",
    playCount: 125000,
    status: "active",
    featured: true,
    createdAt: "2024-01-15",
    fileSize: "15.2 MB"
  },
  {
    id: 2,
    title: "Puzzle Master",
    category: "Puzzle",
    description: "Mind-bending puzzle challenges",
    playCount: 89000,
    status: "active",
    featured: false,
    createdAt: "2024-01-20",
    fileSize: "8.7 MB"
  },
  {
    id: 3,
    title: "Space Defender",
    category: "Action",
    description: "Defend Earth from alien invasion",
    playCount: 156000,
    status: "active",
    featured: true,
    createdAt: "2024-01-25",
    fileSize: "22.1 MB"
  }
];

const categories = ["Action", "Racing", "Puzzle", "Adventure", "Arcade", "Strategy"];

const GameManagement = () => {
  const [games, setGames] = useState(mockGames);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    instructions: "",
    tags: "",
    featured: false,
    file: null as File | null
  });

  const filteredGames = games.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || game.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddGame = async () => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newGame = {
        id: games.length + 1,
        title: formData.title,
        category: formData.category,
        description: formData.description,
        playCount: 0,
        status: "active",
        featured: formData.featured,
        createdAt: new Date().toISOString().split('T')[0],
        fileSize: formData.file ? `${(formData.file.size / 1024 / 1024).toFixed(1)} MB` : "Unknown"
      };

      setGames([...games, newGame]);
      setIsAddDialogOpen(false);
      resetForm();
      
      toast({
        title: "Game added successfully",
        description: `${formData.title} has been added to your games.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add game. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditGame = async () => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setGames(games.map(game => 
        game.id === editingGame.id 
          ? { ...game, ...formData }
          : game
      ));
      
      setEditingGame(null);
      resetForm();
      
      toast({
        title: "Game updated successfully",
        description: `${formData.title} has been updated.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update game. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGame = async (gameId: number) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setGames(games.filter(game => game.id !== gameId));
      
      toast({
        title: "Game deleted",
        description: "The game has been removed from your platform.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete game. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      category: "",
      description: "",
      instructions: "",
      tags: "",
      featured: false,
      file: null
    });
  };

  const openEditDialog = (game: Game) => {
    setEditingGame(game);
    setFormData({
      title: game.title,
      category: game.category,
      description: game.description,
      instructions: game.instructions || "",
      tags: game.tags || "",
      featured: game.featured,
      file: null
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Game Management</h1>
          <p className="text-muted-foreground">
            Manage your game library and add new games to your platform.
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Game
            </Button>
          </DialogTrigger>
          <GameDialog 
            isEdit={false}
            formData={formData}
            setFormData={setFormData}
            onSave={handleAddGame}
            isLoading={isLoading}
            categories={categories}
          />
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">{games.length}</div>
            <p className="text-sm text-muted-foreground">Total Games</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">
              {games.filter(g => g.status === "active").length}
            </div>
            <p className="text-sm text-muted-foreground">Active Games</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">
              {games.filter(g => g.featured).length}
            </div>
            <p className="text-sm text-muted-foreground">Featured Games</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">
              {games.reduce((sum, g) => sum + g.playCount, 0).toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">Total Plays</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search games..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Games Table */}
      <Card>
        <CardHeader>
          <CardTitle>Games ({filteredGames.length})</CardTitle>
          <CardDescription>
            Manage your game collection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Game</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Plays</TableHead>
                <TableHead>File Size</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGames.map((game) => (
                <TableRow key={game.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        🎮
                      </div>
                      <div>
                        <div className="font-medium flex items-center">
                          {game.title}
                          {game.featured && (
                            <Star className="h-4 w-4 text-yellow-500 ml-2 fill-yellow-500" />
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {game.description}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{game.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={game.status === "active" ? "default" : "secondary"}>
                      {game.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{game.playCount.toLocaleString()}</TableCell>
                  <TableCell>{game.fileSize}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Dialog open={editingGame?.id === game.id} onOpenChange={(open) => {
                        if (!open) setEditingGame(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openEditDialog(game)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <GameDialog 
                          isEdit={true}
                          formData={formData}
                          setFormData={setFormData}
                          onSave={handleEditGame}
                          isLoading={isLoading}
                          categories={categories}
                        />
                      </Dialog>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Game</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{game.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteGame(game.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

// Game Dialog Component
interface GameDialogProps {
  isEdit: boolean;
  formData: {
    title: string;
    description: string;
    category: string;
    tags: string;
    thumbnail: string;
    fileUrl: string;
  };
  setFormData: (data: Partial<{ title: string; description: string; category: string; tags: string; thumbnail: string; fileUrl: string }>) => void;
  onSave: () => void;
  isLoading: boolean;
  categories: Array<{ id: number; name: string }>;
}

const GameDialog = ({ isEdit, formData, setFormData, onSave, isLoading, categories }: GameDialogProps) => {
  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{isEdit ? "Edit Game" : "Add New Game"}</DialogTitle>
        <DialogDescription>
          {isEdit ? "Update game information" : "Upload a new game to your platform"}
        </DialogDescription>
      </DialogHeader>
      
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Game Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Enter game title"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData({...formData, category: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category: string) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Game description"
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="instructions">Game Instructions</Label>
          <Textarea
            id="instructions"
            value={formData.instructions}
            onChange={(e) => setFormData({...formData, instructions: e.target.value})}
            placeholder="How to play instructions"
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => setFormData({...formData, tags: e.target.value})}
            placeholder="action, multiplayer, adventure"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="file">Game File (ZIP)</Label>
          <Input
            id="file"
            type="file"
            accept=".zip,.html"
            onChange={(e) => setFormData({...formData, file: e.target.files?.[0] || null})}
          />
          <p className="text-xs text-muted-foreground">
            Upload a ZIP file containing your HTML5 game or a single HTML file
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="featured"
            checked={formData.featured}
            onChange={(e) => setFormData({...formData, featured: e.target.checked})}
            className="rounded border-border"
          />
          <Label htmlFor="featured">Featured Game</Label>
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={onSave} disabled={isLoading}>
          {isLoading ? "Saving..." : (isEdit ? "Update Game" : "Add Game")}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default GameManagement;