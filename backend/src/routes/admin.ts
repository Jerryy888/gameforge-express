import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Admin dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const [
      totalGames,
      totalUsers,
      totalPlays,
      totalViews,
      recentGames,
      topGames,
      analytics
    ] = await Promise.all([
      prisma.game.count(),
      prisma.analytics.aggregate({
        _sum: { uniqueUsers: true }
      }),
      prisma.game.aggregate({
        _sum: { playCount: true }
      }),
      prisma.game.aggregate({
        _sum: { views: true }
      }),
      prisma.game.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { category: true }
      }),
      prisma.game.findMany({
        take: 10,
        orderBy: { playCount: 'desc' },
        include: { category: true }
      }),
      prisma.analytics.findFirst({
        orderBy: { date: 'desc' }
      })
    ]);

    res.json({
      stats: {
        totalGames,
        totalUsers: totalUsers._sum.uniqueUsers || 0,
        totalPlays: totalPlays._sum.playCount || 0,
        totalViews: totalViews._sum.views || 0
      },
      recentGames,
      topGames,
      analytics
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch admin statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all games for admin management
router.get('/games', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [games, total] = await Promise.all([
      prisma.game.findMany({
        skip,
        take: limit,
        include: {
          category: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.game.count()
    ]);

    res.json({
      games,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching games for admin:', error);
    res.status(500).json({ 
      error: 'Failed to fetch games',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all categories for admin management
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { games: true }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });

    res.json({ categories });
  } catch (error) {
    console.error('Error fetching categories for admin:', error);
    res.status(500).json({ 
      error: 'Failed to fetch categories',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create new game
router.post('/games', async (req, res) => {
  try {
    const gameData = req.body;
    
    const game = await prisma.game.create({
      data: {
        ...gameData,
        screenshots: gameData.screenshots ? JSON.stringify(gameData.screenshots) : null,
        tags: gameData.tags ? JSON.stringify(gameData.tags) : null,
      },
      include: { category: true }
    });

    res.status(201).json({ game });
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({ 
      error: 'Failed to create game',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update game
router.put('/games/:id', async (req, res) => {
  try {
    const gameId = parseInt(req.params.id);
    const gameData = req.body;

    const game = await prisma.game.update({
      where: { id: gameId },
      data: {
        ...gameData,
        screenshots: gameData.screenshots ? JSON.stringify(gameData.screenshots) : undefined,
        tags: gameData.tags ? JSON.stringify(gameData.tags) : undefined,
      },
      include: { category: true }
    });

    res.json({ game });
  } catch (error) {
    console.error('Error updating game:', error);
    res.status(500).json({ 
      error: 'Failed to update game',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete game
router.delete('/games/:id', async (req, res) => {
  try {
    const gameId = parseInt(req.params.id);

    await prisma.game.delete({
      where: { id: gameId }
    });

    res.json({ message: 'Game deleted successfully' });
  } catch (error) {
    console.error('Error deleting game:', error);
    res.status(500).json({ 
      error: 'Failed to delete game',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create new category
router.post('/categories', async (req, res) => {
  try {
    const categoryData = req.body;
    
    const category = await prisma.category.create({
      data: categoryData
    });

    res.status(201).json({ category });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ 
      error: 'Failed to create category',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update category
router.put('/categories/:id', async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    const categoryData = req.body;

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: categoryData
    });

    res.json({ category });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ 
      error: 'Failed to update category',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete category
router.delete('/categories/:id', async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);

    await prisma.category.delete({
      where: { id: categoryId }
    });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ 
      error: 'Failed to delete category',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;