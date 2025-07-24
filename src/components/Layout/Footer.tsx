import { Link } from "react-router-dom";
import { Gamepad2, Mail, Github, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-secondary/50 border-t border-border mt-auto">
      {/* Footer Ad Banner Placeholder */}
      <div className="border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="bg-muted/50 rounded-lg p-4 text-center text-sm text-muted-foreground">
            [Advertisement Banner - 728x90]
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Gamepad2 className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                GameHub
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              The ultimate destination for free online games. Play instantly without downloads!
            </p>
            <div className="flex space-x-3">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Game Categories */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Game Categories</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/games/category/action" className="text-muted-foreground hover:text-primary transition-colors">
                  Action Games
                </Link>
              </li>
              <li>
                <Link to="/games/category/puzzle" className="text-muted-foreground hover:text-primary transition-colors">
                  Puzzle Games
                </Link>
              </li>
              <li>
                <Link to="/games/category/adventure" className="text-muted-foreground hover:text-primary transition-colors">
                  Adventure Games
                </Link>
              </li>
              <li>
                <Link to="/games/category/arcade" className="text-muted-foreground hover:text-primary transition-colors">
                  Arcade Games
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/games" className="text-muted-foreground hover:text-primary transition-colors">
                  All Games
                </Link>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Featured Games
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  New Releases
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/dmca" className="text-muted-foreground hover:text-primary transition-colors">
                  DMCA
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border/50 mt-8 pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 GameHub. All rights reserved. Built with ❤️ for gamers worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;