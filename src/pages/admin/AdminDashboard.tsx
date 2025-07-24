import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts";
import { 
  Gamepad2, 
  Users, 
  TrendingUp, 
  Eye,
  Plus,
  Calendar,
  Activity,
  AlertCircle
} from "lucide-react";
import { adminAPI, gameAPI, type AdminStats, type Game } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentGames, setRecentGames] = useState<Game[]>([]);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 并行加载数据
      const [dashboardStats, gamesResponse] = await Promise.all([
        adminAPI.getDashboardStats(),
        gameAPI.getGames({ limit: 10, sort: 'newest' })
      ]);

      setStats(dashboardStats);
      setRecentGames(gamesResponse.games);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
      
      // 如果是401错误，说明未认证
      if (err.status === 401) {
        toast({
          title: "Authentication Required",
          description: "Please log in to access the admin dashboard",
          variant: "destructive"
        });
        navigate('/admin/login');
        return;
      }
      
      // 显示错误提示
      toast({
        title: "Loading Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddGame = () => {
    navigate('/admin/games/new');
  };

  const handleViewAllGames = () => {
    navigate('/admin/games');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Failed to Load Dashboard</h3>
        <p className="text-muted-foreground mb-4 text-center max-w-md">
          {error}
        </p>
        <Button onClick={loadDashboardData}>
          Try Again
        </Button>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your games.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={handleAddGame}>
            <Plus className="h-4 w-4 mr-2" />
            Add Game
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Games
            </CardTitle>
            <Gamepad2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalGames}</div>
            <p className="text-xs text-green-600">
              +3 from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Plays
            </CardTitle>
            <Eye className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats.totalPlays.toLocaleString()}
            </div>
            <p className="text-xs text-green-600">
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Daily Users
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats.dailyUsers.toLocaleString()}
            </div>
            <p className="text-xs text-green-600">
              +8.2% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ad Revenue
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ${stats.revenue.toLocaleString()}
            </div>
            <p className="text-xs text-green-600">
              +15.3% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plays Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Weekly Activity
            </CardTitle>
            <CardDescription>
              Game plays and user activity over the past week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.weeklyActivity}>
                <defs>
                  <linearGradient id="colorPlays" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="plays" 
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorPlays)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Game Categories</CardTitle>
            <CardDescription>
              Distribution of games by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.categoryDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Games */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Recent Games
            </span>
            <Button variant="outline" size="sm" onClick={handleViewAllGames}>
              View All
            </Button>
          </CardTitle>
          <CardDescription>
            Latest games added to your platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentGames.map((game) => (
              <div key={game.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                    {game.thumbnail ? (
                      <img 
                        src={game.thumbnail} 
                        alt={game.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Gamepad2 className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{game.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {game.category?.name || 'Uncategorized'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {game.playCount.toLocaleString()} plays
                    </p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  
                  <Badge 
                    variant={game.isFeature ? "default" : "secondary"}
                    className={game.isFeature ? "bg-primary" : ""}
                  >
                    {game.isFeature ? "featured" : game.status.toLowerCase()}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;