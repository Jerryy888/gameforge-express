import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Menu, 
  X, 
  Gamepad2, 
  Zap,
  Home,
  Grid3X3,
  TrendingUp,
  Clock
} from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { name: "Action", icon: Zap, slug: "action" },
    { name: "Puzzle", icon: Grid3X3, slug: "puzzle" },
    { name: "Adventure", icon: TrendingUp, slug: "adventure" },
    { name: "Arcade", icon: Clock, slug: "arcade" }
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      {/* Top Ad Banner Placeholder */}
      <div className="bg-muted/50 border-b border-border/50">
        <div className="container mx-auto px-4 py-2">
          <div className="bg-secondary/50 rounded-lg p-3 text-center text-sm text-muted-foreground">
            [Advertisement Banner - 728x90]
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <Gamepad2 className="h-8 w-8 text-primary group-hover:text-accent transition-colors" />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-md group-hover:bg-accent/20 transition-colors" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              GameHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className="flex items-center space-x-1 text-foreground hover:text-primary transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            
            {categories.map(({ name, icon: Icon, slug }) => (
              <Link
                key={slug}
                to={`/games/category/${slug}`}
                className="flex items-center space-x-1 text-muted-foreground hover:text-primary transition-colors"
              >
                <Icon className="h-4 w-4" />
                <span>{name}</span>
              </Link>
            ))}
            
            <Link 
              to="/games" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              All Games
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 bg-secondary/50 border-border focus:border-primary"
              />
            </div>
            <Link to="/admin">
              <Button variant="outline" size="sm">
                Admin
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
            <div className="py-4 space-y-3">
              {/* Mobile Search */}
              <div className="relative px-2">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search games..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-secondary/50"
                />
              </div>
              
              {/* Mobile Navigation */}
              <nav className="space-y-2 px-2">
                <Link 
                  to="/" 
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </Link>
                
                {categories.map(({ name, icon: Icon, slug }) => (
                  <Link
                    key={slug}
                    to={`/games/category/${slug}`}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{name}</span>
                  </Link>
                ))}
                
                <Link 
                  to="/games" 
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Grid3X3 className="h-4 w-4" />
                  <span>All Games</span>
                </Link>
                
                <Link 
                  to="/admin" 
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>Admin Panel</span>
                </Link>
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;