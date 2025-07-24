import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest, requireRole, optionalAuth } from '@/middleware/auth';
import { validateCategory, validateId, validatePagination } from '@/middleware/validation';
import { asyncHandler, createError } from '@/middleware/errorHandler';
import * as slugify from 'slugify';

const router = Router();
const prisma = new PrismaClient();

// Get all categories (public)
router.get('/', optionalAuth, asyncHandler(async (req: AuthRequest, res) => {
  const includeInactive = req.admin && req.query.includeInactive === 'true';
  
  const where = includeInactive ? {} : { isActive: true };
  
  const categories = await prisma.category.findMany({
    where,
    orderBy: [
      { sortOrder: 'asc' },
      { name: 'asc' }
    ],
    include: {
      _count: {
        select: {
          games: {
            where: req.admin ? {} : { status: 'ACTIVE' }
          }
        }
      }
    }
  });
  
  // Transform to match frontend interface
  const transformedCategories = categories.map(category => ({
    ...category,
    gameCount: category._count.games
  }));
  
  res.json(transformedCategories);
}));

// Get single category by ID or slug (public)
router.get('/:identifier', asyncHandler(async (req, res) => {
  const { identifier } = req.params;
  const isId = /^\d+$/.test(identifier);
  
  const where = isId 
    ? { id: parseInt(identifier) }
    : { slug: identifier };
  
  const category = await prisma.category.findFirst({
    where: {
      ...where,
      isActive: true
    },
    include: {
      _count: {
        select: {
          games: {
            where: { status: 'ACTIVE' }
          }
        }
      }
    }
  });
  
  if (!category) {
    throw createError('Category not found', 404, 'CATEGORY_NOT_FOUND');
  }
  
  const transformedCategory = {
    ...category,
    gameCount: category._count.games
  };
  
  res.json(transformedCategory);
}));

// Get category by slug with games
router.get('/slug/:slug', asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 12;
  const sort = req.query.sort as string || 'popular';
  
  const skip = (page - 1) * limit;
  
  const category = await prisma.category.findFirst({
    where: { 
      slug,
      isActive: true
    }
  });
  
  if (!category) {
    throw createError('Category not found', 404, 'CATEGORY_NOT_FOUND');
  }
  
  // Build order clause for games
  let orderBy: any = { playCount: 'desc' };
  
  switch (sort) {
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
    case 'popular':
    default:
      orderBy = { playCount: 'desc' };
      break;
  }
  
  const [games, totalGames] = await Promise.all([
    prisma.game.findMany({
      where: {
        categoryId: category.id,
        status: 'ACTIVE'
      },
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
    prisma.game.count({
      where: {
        categoryId: category.id,
        status: 'ACTIVE'
      }
    })
  ]);
  
  res.json({
    category: {
      ...category,
      gameCount: totalGames
    },
    games,
    pagination: {
      page,
      limit,
      total: totalGames,
      totalPages: Math.ceil(totalGames / limit),
      hasNext: page < Math.ceil(totalGames / limit),
      hasPrev: page > 1
    }
  });
}));

// Admin endpoints - Create category
router.post('/', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN']), validateCategory, asyncHandler(async (req: AuthRequest, res) => {
  const { name, description, icon, sortOrder } = req.body;
  
  // Generate slug
  const baseSlug = slugify(name, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;
  
  // Ensure unique slug
  while (await prisma.category.findFirst({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  const category = await prisma.category.create({
    data: {
      name,
      slug,
      description,
      icon,
      sortOrder: sortOrder || 0
    },
    include: {
      _count: {
        select: {
          games: true
        }
      }
    }
  });
  
  const transformedCategory = {
    ...category,
    gameCount: category._count.games
  };
  
  res.status(201).json({
    message: 'Category created successfully',
    category: transformedCategory
  });
}));

// Admin endpoints - Update category
router.put('/:id', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN']), validateId, validateCategory, asyncHandler(async (req: AuthRequest, res) => {
  const categoryId = parseInt(req.params.id);
  const updateData = { ...req.body };
  
  // Check if category exists
  const existingCategory = await prisma.category.findUnique({
    where: { id: categoryId }
  });
  
  if (!existingCategory) {
    throw createError('Category not found', 404, 'CATEGORY_NOT_FOUND');
  }
  
  // Update slug if name changed
  if (updateData.name && updateData.name !== existingCategory.name) {
    const baseSlug = slugify(updateData.name, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;
    
    // Ensure unique slug
    while (await prisma.category.findFirst({ 
      where: { 
        slug,
        id: { not: categoryId }
      } 
    })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    updateData.slug = slug;
  }
  
  const category = await prisma.category.update({
    where: { id: categoryId },
    data: updateData,
    include: {
      _count: {
        select: {
          games: true
        }
      }
    }
  });
  
  const transformedCategory = {
    ...category,
    gameCount: category._count.games
  };
  
  res.json({
    message: 'Category updated successfully',
    category: transformedCategory
  });
}));

// Admin endpoints - Delete category
router.delete('/:id', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN']), validateId, asyncHandler(async (req: AuthRequest, res) => {
  const categoryId = parseInt(req.params.id);
  
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      _count: {
        select: {
          games: true
        }
      }
    }
  });
  
  if (!category) {
    throw createError('Category not found', 404, 'CATEGORY_NOT_FOUND');
  }
  
  if (category._count.games > 0) {
    throw createError('Cannot delete category with existing games', 400, 'CATEGORY_HAS_GAMES');
  }
  
  await prisma.category.delete({
    where: { id: categoryId }
  });
  
  res.json({
    message: 'Category deleted successfully'
  });
}));

// Admin endpoints - Toggle category status
router.patch('/:id/status', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN']), validateId, asyncHandler(async (req: AuthRequest, res) => {
  const categoryId = parseInt(req.params.id);
  const { isActive } = req.body;
  
  if (typeof isActive !== 'boolean') {
    throw createError('isActive must be a boolean', 400, 'INVALID_STATUS');
  }
  
  const category = await prisma.category.update({
    where: { id: categoryId },
    data: { isActive },
    include: {
      _count: {
        select: {
          games: true
        }
      }
    }
  });
  
  const transformedCategory = {
    ...category,
    gameCount: category._count.games
  };
  
  res.json({
    message: 'Category status updated successfully',
    category: transformedCategory
  });
}));

// Admin endpoints - Reorder categories
router.post('/reorder', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  const { categoryOrders } = req.body;
  
  if (!Array.isArray(categoryOrders)) {
    throw createError('categoryOrders must be an array', 400, 'INVALID_ORDER_DATA');
  }
  
  // Update each category's sort order
  const updatePromises = categoryOrders.map(({ id, sortOrder }) =>
    prisma.category.update({
      where: { id },
      data: { sortOrder }
    })
  );
  
  await Promise.all(updatePromises);
  
  res.json({
    message: 'Categories reordered successfully'
  });
}));

// Get category statistics (admin only)
router.get('/:id/stats', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN']), validateId, asyncHandler(async (req: AuthRequest, res) => {
  const categoryId = parseInt(req.params.id);
  
  const category = await prisma.category.findUnique({
    where: { id: categoryId }
  });
  
  if (!category) {
    throw createError('Category not found', 404, 'CATEGORY_NOT_FOUND');
  }
  
  const [
    totalGames,
    activeGames,
    totalPlays,
    averageRating,
    topGames
  ] = await Promise.all([
    prisma.game.count({
      where: { categoryId }
    }),
    prisma.game.count({
      where: { 
        categoryId,
        status: 'ACTIVE'
      }
    }),
    prisma.game.aggregate({
      where: { categoryId },
      _sum: { playCount: true }
    }),
    prisma.game.aggregate({
      where: { 
        categoryId,
        rating: { not: null }
      },
      _avg: { rating: true }
    }),
    prisma.game.findMany({
      where: { categoryId },
      orderBy: { playCount: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        playCount: true,
        rating: true
      }
    })
  ]);
  
  res.json({
    category,
    stats: {
      totalGames,
      activeGames,
      totalPlays: totalPlays._sum.playCount || 0,
      averageRating: averageRating._avg.rating || 0,
      topGames
    }
  });
}));

export default router;