import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { adminAPI } from "@/lib/api";

interface AuthContextType {
  isAuthenticated: boolean;
  admin: any | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('admin-token');
      if (!token) {
        setLoading(false);
        return;
      }

      const result = await adminAPI.verifyToken();
      if (result.valid) {
        setIsAuthenticated(true);
        setAdmin(result.admin);
      } else {
        localStorage.removeItem('admin-token');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('admin-token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const result = await adminAPI.login({ username, password });
      setIsAuthenticated(true);
      setAdmin(result.admin);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await adminAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setAdmin(null);
    }
  };

  const value = {
    isAuthenticated,
    admin,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};