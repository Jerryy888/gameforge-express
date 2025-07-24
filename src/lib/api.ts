// API服务层 - 处理所有后端API调用
const API_BASE_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.PROD 
    ? 'https://your-api-domain.com/api' 
    : 'http://localhost:3000/api'
);

// API响应类型定义 - 根据后端Prisma模型更新
export interface Game {
  id: number;
  title: string;
  slug: string;
  description: string;
  longDescription?: string;
  thumbnail: string;
  screenshots?: string[];
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  categoryId: number;
  tags: string[];
  playCount: number;
  views: number;
  rating?: number;
  reviewCount?: number;
  developer?: string;
  fileSize?: string;
  fileUrl?: string;
  gameUrl?: string;
  isFeature?: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'FEATURED';
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  gameCount: number;
  sortOrder?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Advertisement {
  id: number;
  name: string;
  position: 'HEADER' | 'SIDEBAR' | 'CONTENT' | 'FOOTER' | 'POPUP' | 'BANNER' | 'SKYSCRAPER';
  size: string;
  code: string;
  isActive: boolean;
  impressions: number;
  clicks: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
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
    // 检查是否在浏览器环境中
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('admin-token');
    }
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
        const errorData = await response.json().catch(() => ({}));
        throw {
          status: response.status,
          statusText: response.statusText,
          message: errorData.message || `HTTP error! status: ${response.status}`,
          code: errorData.code,
          response: errorData
        };
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
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin-token', token);
    }
  }

  // 清除认证令牌
  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin-token');
    }
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
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
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

  // 获取单个游戏详情 (支持ID或slug)
  getGame: async (identifier: string | number): Promise<Game> => {
    return apiClient.get(`/games/${identifier}`);
  },

  // 创建游戏 (管理员)
  createGame: async (gameData: {
    title: string;
    description: string;
    longDescription?: string;
    thumbnail: string;
    screenshots?: string[];
    categoryId: number;
    tags?: string[];
    developer?: string;
    fileUrl?: string;
    gameUrl?: string;
    isFeature?: boolean;
  }): Promise<{ message: string; game: Game }> => {
    return apiClient.post('/games', gameData);
  },

  // 更新游戏 (管理员)
  updateGame: async (id: number, gameData: Partial<Game>): Promise<{ message: string; game: Game }> => {
    return apiClient.put(`/games/${id}`, gameData);
  },

  // 删除游戏 (管理员)
  deleteGame: async (id: number): Promise<{ message: string }> => {
    return apiClient.delete(`/games/${id}`);
  },

  // 增加游戏播放次数
  incrementPlayCount: async (id: number): Promise<{ message: string }> => {
    return apiClient.post(`/games/${id}/play`);
  },

  // 获取相关游戏
  getRelatedGames: async (id: number, limit: number = 4): Promise<Game[]> => {
    return apiClient.get(`/games/${id}/related?limit=${limit}`);
  },

  // 切换游戏状态 (管理员)
  updateGameStatus: async (id: number, status: string): Promise<{ message: string; game: Game }> => {
    return apiClient.put(`/games/${id}/status`, { status });
  },

  // 批量操作 (管理员)
  bulkOperation: async (action: string, gameIds: number[]): Promise<{ message: string; affected: number }> => {
    return apiClient.post('/games/bulk', { action, gameIds });
  },
};

// 分类相关API
export const categoryAPI = {
  // 获取所有分类
  getCategories: async (includeInactive?: boolean): Promise<Category[]> => {
    const params = includeInactive ? '?includeInactive=true' : '';
    return apiClient.get(`/categories${params}`);
  },

  // 获取单个分类 (支持ID或slug)
  getCategory: async (identifier: string | number): Promise<Category> => {
    return apiClient.get(`/categories/${identifier}`);
  },

  // 根据slug获取分类及其游戏
  getCategoryWithGames: async (slug: string, params?: {
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<{
    category: Category;
    games: Game[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return apiClient.get(`/categories/slug/${slug}?${searchParams.toString()}`);
  },

  // 创建分类 (管理员)
  createCategory: async (categoryData: {
    name: string;
    description?: string;
    icon?: string;
    sortOrder?: number;
  }): Promise<{ message: string; category: Category }> => {
    return apiClient.post('/categories', categoryData);
  },

  // 更新分类 (管理员)
  updateCategory: async (id: number, categoryData: Partial<Category>): Promise<{ message: string; category: Category }> => {
    return apiClient.put(`/categories/${id}`, categoryData);
  },

  // 删除分类 (管理员)
  deleteCategory: async (id: number): Promise<{ message: string }> => {
    return apiClient.delete(`/categories/${id}`);
  },

  // 切换分类状态 (管理员)
  toggleCategoryStatus: async (id: number, isActive: boolean): Promise<{ message: string; category: Category }> => {
    return apiClient.put(`/categories/${id}/status`, { isActive });
  },

  // 重新排序分类 (管理员)
  reorderCategories: async (categoryOrders: Array<{ id: number; sortOrder: number }>): Promise<{ message: string }> => {
    return apiClient.post('/categories/reorder', { categoryOrders });
  },

  // 获取分类统计 (管理员)
  getCategoryStats: async (id: number): Promise<{
    category: Category;
    stats: {
      totalGames: number;
      activeGames: number;
      totalPlays: number;
      averageRating: number;
      topGames: Array<{
        id: number;
        title: string;
        playCount: number;
        rating: number;
      }>;
    };
  }> => {
    return apiClient.get(`/categories/${id}/stats`);
  },
};

// 广告相关API
export const adAPI = {
  // 获取所有广告 (管理员)
  getAds: async (includeInactive?: boolean): Promise<Advertisement[]> => {
    const params = includeInactive ? '?includeInactive=true' : '';
    return apiClient.get(`/ads${params}`);
  },

  // 获取特定位置的广告 (公开接口)
  getAdsByPosition: async (position: string): Promise<Advertisement[]> => {
    return apiClient.get(`/ads/position/${position}`);
  },

  // 获取单个广告 (管理员)
  getAd: async (id: number): Promise<Advertisement> => {
    return apiClient.get(`/ads/${id}`);
  },

  // 创建广告 (管理员)
  createAd: async (adData: {
    name: string;
    position: string;
    size: string;
    code: string;
    isActive?: boolean;
    startDate?: string;
    endDate?: string;
  }): Promise<{ message: string; ad: Advertisement }> => {
    return apiClient.post('/ads', adData);
  },

  // 更新广告 (管理员)
  updateAd: async (id: number, adData: Partial<Advertisement>): Promise<{ message: string; ad: Advertisement }> => {
    return apiClient.put(`/ads/${id}`, adData);
  },

  // 删除广告 (管理员)
  deleteAd: async (id: number): Promise<{ message: string }> => {
    return apiClient.delete(`/ads/${id}`);
  },

  // 切换广告状态 (管理员)
  toggleAdStatus: async (id: number, isActive: boolean): Promise<{ message: string; ad: Advertisement }> => {
    return apiClient.put(`/ads/${id}/toggle`, { isActive });
  },

  // 跟踪广告点击 (公开接口)
  trackAdClick: async (id: number): Promise<{ message: string }> => {
    return apiClient.post(`/ads/${id}/click`);
  },

  // 获取广告统计 (管理员)
  getAdStats: async (id: number, days?: number): Promise<{
    ad: {
      id: number;
      name: string;
      position: string;
    };
    stats: {
      impressions: number;
      clicks: number;
      ctr: number;
      isActive: boolean;
      createdAt: string;
      lastUpdated: string;
    };
  }> => {
    const params = days ? `?days=${days}` : '';
    return apiClient.get(`/ads/${id}/stats${params}`);
  },

  // 获取所有广告统计概览 (管理员)
  getAdsOverview: async (): Promise<{
    overview: {
      totalAds: number;
      activeAds: number;
      totalImpressions: number;
      totalClicks: number;
      overallCTR: number;
    };
    byPosition: Array<{
      position: string;
      count: number;
      impressions: number;
      clicks: number;
      ctr: number;
    }>;
  }> => {
    return apiClient.get('/ads/stats/overview');
  },

  // 批量操作 (管理员)
  bulkOperation: async (action: 'delete' | 'activate' | 'deactivate', adIds: number[]): Promise<{ message: string; affected: number }> => {
    return apiClient.post('/ads/bulk', { action, adIds });
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
  searchGames: async (query: string, params?: {
    category?: string;
    minRating?: number;
    sortBy?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    games: Game[];
    suggestions: string[];
    total: number;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    searchInfo: {
      query: string;
      categoryId?: number;
      minRating?: number;
      sortBy: string;
      executionTime: number;
    };
  }> => {
    const searchParams = new URLSearchParams({ q: query });
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return apiClient.get(`/search?${searchParams.toString()}`);
  },

  // 高级搜索
  advancedSearch: async (searchData: {
    query?: string;
    categories?: number[];
    minRating?: number;
    maxRating?: number;
    minPlayCount?: number;
    tags?: string[];
    developer?: string;
    featured?: boolean;
    sortBy?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    games: Game[];
    total: number;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    filters: typeof searchData;
  }> => {
    return apiClient.post('/search/advanced', searchData);
  },

  // 获取搜索建议
  getSuggestions: async (query: string): Promise<string[]> => {
    return apiClient.get(`/search/suggestions?q=${encodeURIComponent(query)}`);
  },

  // 获取热门搜索词
  getTrendingSearches: async (limit?: number): Promise<string[]> => {
    const params = limit ? `?limit=${limit}` : '';
    return apiClient.get(`/search/trending${params}`);
  },
};

// 文件上传相关API
export const uploadAPI = {
  // 上传单个文件 (管理员)
  uploadSingle: async (file: File, gameId?: number): Promise<{
    message: string;
    file: {
      id: number;
      filename: string;
      originalName: string;
      size: number;
      formattedSize: string;
      mimeType: string;
      url: string;
      uploadedAt: string;
    };
  }> => {
    return apiClient.uploadFile('/upload/single', file, gameId ? { gameId } : {});
  },

  // 上传多个文件 (管理员)
  uploadMultiple: async (files: File[], gameId?: number): Promise<{
    message: string;
    files: Array<{
      id: number;
      filename: string;
      originalName: string;
      size: number;
      formattedSize: string;
      mimeType: string;
      url: string;
      uploadedAt: string;
    }>;
  }> => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    if (gameId) formData.append('gameId', gameId.toString());

    return apiClient.request('/upload/multiple', {
      method: 'POST',
      body: formData,
      headers: {
        ...(apiClient.token && { Authorization: `Bearer ${apiClient.token}` }),
      },
    });
  },

  // 上传游戏文件 (管理员)
  uploadGameFile: async (file: File, gameId?: number): Promise<{
    message: string;
    fileUrl: string;
    fileSize: string;
    file: {
      id: number;
      filename: string;
      originalName: string;
      size: number;
      formattedSize: string;
      url: string;
    };
  }> => {
    return apiClient.uploadFile('/upload/game', file, gameId ? { gameId } : {});
  },

  // 上传图片 (管理员)
  uploadImage: async (image: File): Promise<{
    message: string;
    imageUrl: string;
    image: {
      id: number;
      filename: string;
      originalName: string;
      size: number;
      formattedSize: string;
      url: string;
    };
  }> => {
    return apiClient.uploadFile('/upload/image', image);
  },

  // 获取上传文件列表 (管理员)
  getUploadedFiles: async (params?: {
    page?: number;
    limit?: number;
    gameId?: number;
  }): Promise<{
    files: Array<{
      id: number;
      filename: string;
      originalName: string;
      size: number;
      formattedSize: string;
      mimeType: string;
      url: string;
      gameId?: number;
      uploadedBy: string;
      createdAt: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return apiClient.get(`/upload?${searchParams.toString()}`);
  },

  // 删除上传文件 (管理员)
  deleteUploadedFile: async (id: number): Promise<{ message: string }> => {
    return apiClient.delete(`/upload/${id}`);
  },

  // 获取文件信息 (管理员)
  getFileInfo: async (id: number): Promise<{
    id: number;
    filename: string;
    originalName: string;
    size: number;
    formattedSize: string;
    mimeType: string;
    url: string;
    path: string;
    gameId?: number;
    uploadedBy: string;
    createdAt: string;
    exists: boolean;
  }> => {
    return apiClient.get(`/upload/${id}`);
  },

  // 获取上传统计 (管理员)
  getUploadStats: async (): Promise<{
    overview: {
      totalFiles: number;
      totalSize: number;
      formattedTotalSize: string;
    };
    byType: Array<{
      mimeType: string;
      count: number;
      totalSize: number;
      formattedSize: string;
    }>;
    recentUploads: Array<{
      id: number;
      filename: string;
      originalName: string;
      size: number;
      formattedSize: string;
      mimeType: string;
      uploadedBy: string;
      createdAt: string;
    }>;
  }> => {
    return apiClient.get('/upload/stats/overview');
  },
};

// 导出API客户端以便在组件中使用
export { apiClient };

// 错误处理工具
export const handleApiError = (error: unknown) => {
  const apiError = error as {
    status?: number;
    statusText?: string;
    message?: string;
    code?: string;
    response?: any;
  };

  if (apiError.status === 401) {
    // 未授权，清除token并重定向到登录页
    apiClient.clearToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login';
    }
  }
  
  return {
    message: apiError.message || 'An unexpected error occurred',
    status: apiError.status || 500,
    code: apiError.code,
    statusText: apiError.statusText,
  };
};