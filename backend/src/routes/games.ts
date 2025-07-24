import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest, requireRole, optionalAuth } from '@/middleware/auth';
import { validateGame, validateId, validatePagination } from '@/middleware/validation';
import { asyncHandler, createError } from '@/middleware/errorHandler';
import * as slugify from 'slugify';

const router = Router();
const prisma = new PrismaClient();

// Get all games (public endpoint with optional auth for admin data)
router.get('/', validatePagination, optionalAuth, asyncHandler(async (req: AuthRequest, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 12;
  const category = req.query.category as string;
  const search = req.query.search as string;
  const sort = req.query.sort as string || 'popular';
  const featured = req.query.featured === 'true';
  
  const skip = (page - 1) * limit;
  
  // Build where clause
  const where: any = {
    status: req.admin ? undefined : 'ACTIVE' // Admins can see all games
  };
  
  if (category) {
    where.category = { slug: category };
  }
  
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { developer: { contains: search, mode: 'insensitive' } }
    ];
  }
  
  if (featured) {
    where.isFeature = true;
  }
  
  // Build order clause
  let orderBy: any = { createdAt: 'desc' };
  
  switch (sort) {
    case 'popular':
      orderBy = { playCount: 'desc' };
      break;
    case 'newest':
      orderBy = { createdAt: 'desc' };
      break;
    case 'oldest':
      orderBy = { createdAt: 'asc' };
      break;
    case 'rating':
      orderBy = { rating: 'desc' };
      break;
    case 'name':
      orderBy = { title: 'asc' };
      break;
    case 'plays':
      orderBy = { playCount: 'desc' };
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
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    }
  });
}));

// Get single game by ID or slug (public)
router.get('/:identifier', asyncHandler(async (req, res) => {
  const { identifier } = req.params;
  const isId = /^\d+$/.test(identifier);
  
  const where = isId 
    ? { id: parseInt(identifier) }
    : { slug: identifier };
  
  const game = await prisma.game.findFirst({
    where: {
      ...where,
      status: 'ACTIVE'
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true
        }
      }
    }
  });
  
  if (!game) {
    throw createError('Game not found', 404, 'GAME_NOT_FOUND');
  }
  
  // Increment view count
  await prisma.game.update({
    where: { id: game.id },
    data: { views: { increment: 1 } }
  });
  
  res.json(game);
}));

// Increment play count
router.post('/:id/play', validateId, asyncHandler(async (req, res) => {
  const gameId = parseInt(req.params.id);
  
  const game = await prisma.game.findFirst({
    where: { 
      id: gameId,
      status: 'ACTIVE'
    }
  });
  
  if (!game) {
    throw createError('Game not found', 404, 'GAME_NOT_FOUND');
  }
  
  await prisma.game.update({
    where: { id: gameId },
    data: { playCount: { increment: 1 } }
  });
  
  res.json({ message: 'Play count updated' });
}));

// Get related games
router.get('/:id/related', validateId, asyncHandler(async (req, res) => {
  const gameId = parseInt(req.params.id);
  const limit = parseInt(req.query.limit as string) || 4;
  
  const game = await prisma.game.findFirst({
    where: { 
      id: gameId,
      status: 'ACTIVE'
    },
    select: {
      categoryId: true,
      tags: true
    }
  });
  
  if (!game) {
    throw createError('Game not found', 404, 'GAME_NOT_FOUND');
  }
  
  const relatedGames = await prisma.game.findMany({
    where: {
      AND: [
        { id: { not: gameId } },
        { status: 'ACTIVE' },
        { categoryId: game.categoryId }
      ]
    },
    orderBy: [
      { rating: 'desc' },
      { playCount: 'desc' }
    ],
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
  });
  
  res.json(relatedGames);
}));

// Admin endpoints - Create game
router.post('/', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN']), validateGame, asyncHandler(async (req: AuthRequest, res) => {
  const {
    title,
    description,
    longDescription,
    thumbnail,
    screenshots,
    categoryId,
    tags,
    developer,
    fileUrl,
    gameUrl,
    isFeature
  } = req.body;
  
  // Generate slug
  const baseSlug = slugify(title, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;
  
  // Ensure unique slug
  while (await prisma.game.findFirst({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  const game = await prisma.game.create({
    data: {
      title,
      slug,
      description,
      longDescription,
      thumbnail,
      screenshots: screenshots || [],
      categoryId,
      tags: tags || [],
      developer,
      fileUrl,
      gameUrl,
      isFeature: isFeature || false,
      status: 'ACTIVE'
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      }
    }
  });
  
  res.status(201).json({
    message: 'Game created successfully',
    game
  });
}));

// Admin endpoints - Update game
router.put('/:id', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN']), validateId, validateGame, asyncHandler(async (req: AuthRequest, res) => {
  const gameId = parseInt(req.params.id);
  const updateData = { ...req.body };
  
  // Check if game exists
  const existingGame = await prisma.game.findUnique({
    where: { id: gameId }
  });
  
  if (!existingGame) {
    throw createError('Game not found', 404, 'GAME_NOT_FOUND');
  }
  
  // Update slug if title changed
  if (updateData.title && updateData.title !== existingGame.title) {
    const baseSlug = slugify(updateData.title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;
    
    // Ensure unique slug
    while (await prisma.game.findFirst({ 
      where: { 
        slug,
        id: { not: gameId }
      } 
    })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    updateData.slug = slug;
  }
  
  const game = await prisma.game.update({
    where: { id: gameId },
    data: updateData,
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      }
    }
  });
  
  res.json({
    message: 'Game updated successfully',
    game
  });
}));

// Admin endpoints - Delete game
router.delete('/:id', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN']), validateId, asyncHandler(async (req: AuthRequest, res) => {
  const gameId = parseInt(req.params.id);
  
  const game = await prisma.game.findUnique({
    where: { id: gameId }
  });
  
  if (!game) {
    throw createError('Game not found', 404, 'GAME_NOT_FOUND');
  }
  
  await prisma.game.delete({
    where: { id: gameId }
  });
  
  res.json({
    message: 'Game deleted successfully'
  });
}));

// Admin endpoints - Toggle game status
router.patch('/:id/status', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN']), validateId, asyncHandler(async (req: AuthRequest, res) => {
  const gameId = parseInt(req.params.id);
  const { status } = req.body;
  
  if (!['ACTIVE', 'INACTIVE', 'PENDING', 'FEATURED'].includes(status)) {
    throw createError('Invalid status', 400, 'INVALID_STATUS');
  }
  
  const game = await prisma.game.update({
    where: { id: gameId },
    data: { 
      status,
      ...(status === 'FEATURED' && { isFeature: true })
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      }
    }
  });
  
  res.json({
    message: 'Game status updated successfully',
    game
  });
}));

// Admin endpoints - Bulk operations
router.post('/bulk', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  const { action, gameIds } = req.body;
  
  if (!gameIds || !Array.isArray(gameIds) || gameIds.length === 0) {
    throw createError('Game IDs are required', 400, 'MISSING_GAME_IDS');
  }
  
  let result;
  
  switch (action) {
    case 'delete':
      result = await prisma.game.deleteMany({
        where: { id: { in: gameIds } }
      });
      break;
      
    case 'activate':
      result = await prisma.game.updateMany({
        where: { id: { in: gameIds } },
        data: { status: 'ACTIVE' }
      });
      break;
      
    case 'deactivate':
      result = await prisma.game.updateMany({
        where: { id: { in: gameIds } },
        data: { status: 'INACTIVE' }
      });
      break;
      
    case 'feature':
      result = await prisma.game.updateMany({
        where: { id: { in: gameIds } },
        data: { 
          isFeature: true,
          status: 'FEATURED'
        }
      });
      break;
      
    default:
      throw createError('Invalid bulk action', 400, 'INVALID_BULK_ACTION');
  }
  
  res.json({
    message: `Bulk ${action} completed successfully`,
    affected: result.count
  });
}));

export default router;