import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { validateSearch } from '@/middleware/validation';
import { asyncHandler, createError } from '@/middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// Search games
router.get('/', validateSearch, asyncHandler(async (req: Request, res: Response) => {
  const query = req.query.q as string;
  const categoryId = req.query.category ? parseInt(req.query.category as string) : undefined;
  const minRating = req.query.minRating ? parseFloat(req.query.minRating as string) : undefined;
  const sortBy = req.query.sortBy as string || 'relevance';
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 12;
  
  const skip = (page - 1) * limit;
  
  // Log search query for analytics
  await prisma.searchQuery.create({
    data: {
      query,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    }
  }).catch(() => {}); // Ignore errors for analytics
  
  // Build where clause
  const where: any = {
    status: 'ACTIVE',
    OR: [
      { title: { contains: query } },
      { description: { contains: query } },
      { developer: { contains: query } }
    ]
  };
  
  if (categoryId) {
    where.categoryId = categoryId;
  }
  
  if (minRating) {
    where.rating = { gte: minRating };
  }
  
  // Build order clause
  let orderBy: any = [
    { isFeature: 'desc' },
    { playCount: 'desc' }
  ];
  
  switch (sortBy) {
    case 'newest':
      orderBy = { createdAt: 'desc' };
      break;
    case 'oldest':
      orderBy = { createdAt: 'asc' };
      break;
    case 'popular':
      orderBy = { playCount: 'desc' };
      break;
    case 'rating':
      orderBy = [
        { rating: 'desc' },
        { reviewCount: 'desc' }
      ];
      break;
    case 'name':
      orderBy = { title: 'asc' };
      break;
    case 'relevance':
    default:
      // For relevance, we'll use a combination of factors
      orderBy = [
        { isFeature: 'desc' },
        { rating: 'desc' },
        { playCount: 'desc' }
      ];
      break;
  }
  
  const [games, total] = await Promise.all([
    prisma.game.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    }),
    prisma.game.count({ where })
  ]);
  
  // Update search query with results count
  await prisma.searchQuery.updateMany({
    where: {
      query,
      results: 0,
      createdAt: {
        gte: new Date(Date.now() - 60000) // Last minute
      }
    },
    data: { results: total }
  }).catch(() => {}); // Ignore errors
  
  // Generate suggestions if no results
  let suggestions: string[] = [];
  if (total === 0) {
    suggestions = await generateSuggestions(query);
  }
  
  res.json({
    games,
    suggestions,
    total,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    },
    searchInfo: {
      query,
      categoryId,
      minRating,
      sortBy,
      executionTime: Date.now() - parseInt(req.get('X-Request-Start') || '0')
    }
  });
}));

// Get search suggestions
router.get('/suggestions', asyncHandler(async (req: Request, res: Response) => {
  const query = req.query.q as string;
  
  if (!query || query.length < 2) {
    return res.json([]);
  }
  
  // Get game titles that match the query
  const gameSuggestions = await prisma.game.findMany({
    where: {
      title: {
        contains: query
      },
      status: 'ACTIVE'
    },
    select: {
      title: true
    },
    orderBy: {
      playCount: 'desc'
    },
    take: 5
  });
  
  // Get category names that match
  const categorySuggestions = await prisma.category.findMany({
    where: {
      name: {
        contains: query
      },
      isActive: true
    },
    select: {
      name: true
    },
    take: 3
  });
  
  // Get developer names that match
  const developerSuggestions = await prisma.game.findMany({
    where: {
      developer: {
        contains: query
      },
      status: 'ACTIVE'
    },
    select: {
      developer: true
    },
    distinct: ['developer'],
    take: 3
  });
  
  // Combine and deduplicate suggestions
  const suggestions = [
    ...gameSuggestions.map(g => g.title),
    ...categorySuggestions.map(c => c.name),
    ...developerSuggestions.map(d => d.developer).filter(Boolean)
  ];
  
  const uniqueSuggestions = [...new Set(suggestions)].slice(0, 8);
  
  res.json(uniqueSuggestions);
}));

// Get trending searches
router.get('/trending', asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;
  
  // Get most searched terms from the last 7 days
  const trendingSearches = await prisma.searchQuery.groupBy({
    by: ['query'],
    where: {
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      results: {
        gt: 0
      }
    },
    _count: {
      query: true
    },
    orderBy: {
      _count: {
        query: 'desc'
      }
    },
    take: limit
  });
  
  const trending = trendingSearches.map(item => item.query);
  
  res.json(trending);
}));

// Advanced search with filters
router.post('/advanced', asyncHandler(async (req: Request, res: Response) => {
  const {
    query,
    categories,
    minRating,
    maxRating,
    minPlayCount,
    tags,
    developer,
    featured,
    sortBy,
    page = 1,
    limit = 12
  } = req.body;
  
  const skip = (page - 1) * limit;
  
  // Build complex where clause
  const where: any = {
    status: 'ACTIVE'
  };
  
  if (query) {
    where.OR = [
      { title: { contains: query } },
      { description: { contains: query } },
      { developer: { contains: query } }
    ];
  }
  
  if (categories && categories.length > 0) {
    where.categoryId = { in: categories };
  }
  
  if (minRating !== undefined || maxRating !== undefined) {
    where.rating = {};
    if (minRating !== undefined) where.rating.gte = minRating;
    if (maxRating !== undefined) where.rating.lte = maxRating;
  }
  
  if (minPlayCount !== undefined) {
    where.playCount = { gte: minPlayCount };
  }
  
  if (developer) {
    where.developer = { contains: developer };
  }
  
  if (featured === true) {
    where.isFeature = true;
  }
  
  // Handle tags search (JSON string contains - simplified)
  if (tags && tags.length > 0) {
    where.tags = {
      contains: tags[0]  // Simplified: just check first tag
    };
  }
  
  // Build order clause
  let orderBy: any = { createdAt: 'desc' };
  
  switch (sortBy) {
    case 'popular':
      orderBy = { playCount: 'desc' };
      break;
    case 'rating':
      orderBy = [
        { rating: 'desc' },
        { reviewCount: 'desc' }
      ];
      break;
    case 'name':
      orderBy = { title: 'asc' };
      break;
    case 'newest':
      orderBy = { createdAt: 'desc' };
      break;
    case 'oldest':
      orderBy = { createdAt: 'asc' };
      break;
  }
  
  const [games, total] = await Promise.all([
    prisma.game.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    }),
    prisma.game.count({ where })
  ]);
  
  res.json({
    games,
    total,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    },
    filters: {
      query,
      categories,
      minRating,
      maxRating,
      minPlayCount,
      tags,
      developer,
      featured,
      sortBy
    }
  });
}));

// Helper function to generate search suggestions
async function generateSuggestions(query: string): Promise<string[]> {
  // Simple suggestion algorithm - find similar game titles
  const similarGames = await prisma.game.findMany({
    where: {
      OR: [
        {
          title: {
            contains: query.substring(0, Math.max(2, query.length - 1))
          }
        },
        {
          title: {
            contains: query
          }
        }
      ],
      status: 'ACTIVE'
    },
    select: {
      title: true
    },
    orderBy: {
      playCount: 'desc'
    },
    take: 5
  });
  
  return similarGames.map(game => game.title);
}

export default router;