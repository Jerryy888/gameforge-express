// API服务层 - 处理所有后端API调用
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-api-domain.com/api' 
  : 'http://localhost:3000/api';

// API响应类型定义
export interface Game {
  id: number;
  title: string;
  description: string;
  longDescription?: string;
  thumbnail: string;
  screenshots?: string[];
  category: string;
  categoryId: number;
  tags: string[];
  playCount: number;
  rating?: number;
  reviews?: number;
  releaseDate: string;
  developer?: string;
  fileSize?: string;
  fileUrl?: string;
  isFeature?: boolean;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  gameCount: number;
  sortOrder?: number;
  createdAt: string;
}

export interface Advertisement {
  id: number;
  name: string;
  position: string;
  size: string;
  code: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdminStats {
  totalGames: number;
  totalPlays: number;
  dailyUsers: number;
  revenue: number;
  weeklyActivity: Array<{
    name: string;
    plays: number;
    users: number;
  }>;
  categoryDistribution: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
}

// HTTP请求工具类
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('admin-token');
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API Error: ${endpoint}`, error);
      throw error;
    }
  }

  // GET请求
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST请求
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT请求
  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE请求
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // 文件上传
  async uploadFile<T>(endpoint: string, file: File, additionalData?: Record<string, unknown>): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    return this.request<T>(endpoint, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    });
  }

  // 设置认证令牌
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('admin-token', token);
  }

  // 清除认证令牌
  clearToken() {
    this.token = null;
    localStorage.removeItem('admin-token');
  }
}

// 创建API客户端实例
const apiClient = new ApiClient(API_BASE_URL);

// 游戏相关API
export const gameAPI = {
  // 获取游戏列表
  getGames: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sort?: string;
    featured?: boolean;
  }): Promise<{
    games: Game[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return apiClient.get(`/games?${searchParams.toString()}`);
  },

  // 获取单个游戏详情
  getGame: async (id: number): Promise<Game> => {
    return apiClient.get(`/games/${id}`);
  },

  // 创建游戏
  createGame: async (gameData: Omit<Game, 'id' | 'createdAt' | 'updatedAt'>): Promise<Game> => {
    return apiClient.post('/games', gameData);
  },

  // 更新游戏
  updateGame: async (id: number, gameData: Partial<Game>): Promise<Game> => {
    return apiClient.put(`/games/${id}`, gameData);
  },

  // 删除游戏
  deleteGame: async (id: number): Promise<void> => {
    return apiClient.delete(`/games/${id}`);
  },

  // 上传游戏文件
  uploadGameFile: async (file: File, gameId?: number): Promise<{ fileUrl: string; fileSize: string }> => {
    return apiClient.uploadFile('/games/upload', file, gameId ? { gameId } : {});
  },

  // 增加游戏播放次数
  incrementPlayCount: async (id: number): Promise<void> => {
    return apiClient.post(`/games/${id}/play`);
  },

  // 获取相关游戏
  getRelatedGames: async (id: number, limit: number = 4): Promise<Game[]> => {
    return apiClient.get(`/games/${id}/related?limit=${limit}`);
  },
};

// 分类相关API
export const categoryAPI = {
  // 获取所有分类
  getCategories: async (): Promise<Category[]> => {
    return apiClient.get('/categories');
  },

  // 获取单个分类
  getCategory: async (id: number): Promise<Category> => {
    return apiClient.get(`/categories/${id}`);
  },

  // 根据slug获取分类
  getCategoryBySlug: async (slug: string): Promise<Category> => {
    return apiClient.get(`/categories/slug/${slug}`);
  },

  // 创建分类
  createCategory: async (categoryData: Omit<Category, 'id' | 'gameCount' | 'createdAt'>): Promise<Category> => {
    return apiClient.post('/categories', categoryData);
  },

  // 更新分类
  updateCategory: async (id: number, categoryData: Partial<Category>): Promise<Category> => {
    return apiClient.put(`/categories/${id}`, categoryData);
  },

  // 删除分类
  deleteCategory: async (id: number): Promise<void> => {
    return apiClient.delete(`/categories/${id}`);
  },
};

// 广告相关API
export const adAPI = {
  // 获取所有广告
  getAds: async (): Promise<Advertisement[]> => {
    return apiClient.get('/ads');
  },

  // 获取特定位置的广告
  getAdsByPosition: async (position: string): Promise<Advertisement[]> => {
    return apiClient.get(`/ads/position/${position}`);
  },

  // 创建广告
  createAd: async (adData: Omit<Advertisement, 'id' | 'createdAt'>): Promise<Advertisement> => {
    return apiClient.post('/ads', adData);
  },

  // 更新广告
  updateAd: async (id: number, adData: Partial<Advertisement>): Promise<Advertisement> => {
    return apiClient.put(`/ads/${id}`, adData);
  },

  // 删除广告
  deleteAd: async (id: number): Promise<void> => {
    return apiClient.delete(`/ads/${id}`);
  },

  // 切换广告状态
  toggleAd: async (id: number, isActive: boolean): Promise<Advertisement> => {
    return apiClient.put(`/ads/${id}/toggle`, { isActive });
  },
};

// 管理员相关API
export const adminAPI = {
  // 登录
  login: async (credentials: { username: string; password: string }): Promise<{
    token: string;
    admin: { id: number; username: string };
  }> => {
    const response = await apiClient.post<{ token: string; admin: { id: number; username: string } }>('/auth/login', credentials);
    if (response?.token) {
      apiClient.setToken(response.token);
    }
    return response;
  },

  // 登出
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
    apiClient.clearToken();
  },

  // 验证令牌
  verifyToken: async (): Promise<{ valid: boolean; admin?: { id: number; username: string } }> => {
    return apiClient.get('/auth/verify');
  },

  // 获取仪表板统计数据
  getDashboardStats: async (): Promise<AdminStats> => {
    return apiClient.get('/admin/stats');
  },
};

// 搜索相关API
export const searchAPI = {
  // 搜索游戏
  searchGames: async (query: string, filters?: {
    category?: string;
    minRating?: number;
    sortBy?: string;
  }): Promise<{
    games: Game[];
    suggestions: string[];
    total: number;
  }> => {
    const searchParams = new URLSearchParams({ q: query });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return apiClient.get(`/search?${searchParams.toString()}`);
  },

  // 获取搜索建议
  getSuggestions: async (query: string): Promise<string[]> => {
    return apiClient.get(`/search/suggestions?q=${encodeURIComponent(query)}`);
  },

  // 获取热门搜索词
  getTrendingSearches: async (): Promise<string[]> => {
    return apiClient.get('/search/trending');
  },
};

// 导出API客户端以便在组件中使用
export { apiClient };

// 错误处理工具
export const handleApiError = (error: unknown) => {
  if (error.response?.status === 401) {
    // 未授权，重定向到登录页
    apiClient.clearToken();
    window.location.href = '/admin/login';
  }
  
  return {
    message: error instanceof Error ? error.message : 'An unexpected error occurred',
    status: (error as { response?: { status?: number } }).response?.status || 500,
  };
};