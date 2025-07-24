import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest, requireRole } from '@/middleware/auth';
import { validateAd, validateId } from '@/middleware/validation';
import { asyncHandler, createError } from '@/middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// Get all ads (admin only)
router.get('/', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  const includeInactive = req.query.includeInactive === 'true';
  
  const where = includeInactive ? {} : { isActive: true };
  
  const ads = await prisma.advertisement.findMany({
    where,
    orderBy: [
      { position: 'asc' },
      { createdAt: 'desc' }
    ]
  });
  
  res.json(ads);
}));

// Get ads by position (public endpoint for display)
router.get('/position/:position', asyncHandler(async (req, res) => {
  const { position } = req.params;
  
  const validPositions = ['HEADER', 'SIDEBAR', 'CONTENT', 'FOOTER', 'POPUP', 'BANNER', 'SKYSCRAPER'];
  
  if (!validPositions.includes(position.toUpperCase())) {
    throw createError('Invalid ad position', 400, 'INVALID_POSITION');
  }
  
  const ads = await prisma.advertisement.findMany({
    where: {
      position: position.toUpperCase() as any,
      isActive: true,
      OR: [
        { startDate: null },
        { startDate: { lte: new Date() } }
      ],
      AND: [
        {
          OR: [
            { endDate: null },
            { endDate: { gte: new Date() } }
          ]
        }
      ]
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  
  // Increment impressions for displayed ads
  if (ads.length > 0) {
    const adIds = ads.map(ad => ad.id);
    await prisma.advertisement.updateMany({
      where: { id: { in: adIds } },
      data: { impressions: { increment: 1 } }
    }).catch(() => {}); // Ignore errors for analytics
  }
  
  res.json(ads);
}));

// Track ad click
router.post('/:id/click', validateId, asyncHandler(async (req, res) => {
  const adId = parseInt(req.params.id);
  
  const ad = await prisma.advertisement.findFirst({
    where: { 
      id: adId,
      isActive: true
    }
  });
  
  if (!ad) {
    throw createError('Ad not found', 404, 'AD_NOT_FOUND');
  }
  
  await prisma.advertisement.update({
    where: { id: adId },
    data: { clicks: { increment: 1 } }
  });
  
  res.json({ message: 'Click tracked successfully' });
}));

// Get single ad (admin only)
router.get('/:id', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN']), validateId, asyncHandler(async (req: AuthRequest, res) => {
  const adId = parseInt(req.params.id);
  
  const ad = await prisma.advertisement.findUnique({
    where: { id: adId }
  });
  
  if (!ad) {
    throw createError('Ad not found', 404, 'AD_NOT_FOUND');
  }
  
  res.json(ad);
}));

// Create ad (admin only)
router.post('/', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN']), validateAd, asyncHandler(async (req: AuthRequest, res) => {
  const {
    name,
    position,
    size,
    code,
    isActive,
    startDate,
    endDate
  } = req.body;
  
  const ad = await prisma.advertisement.create({
    data: {
      name,
      position: position.toUpperCase(),
      size,
      code,
      isActive: isActive !== false,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null
    }
  });
  
  res.status(201).json({
    message: 'Ad created successfully',
    ad
  });
}));

// Update ad (admin only)
router.put('/:id', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN']), validateId, validateAd, asyncHandler(async (req: AuthRequest, res) => {
  const adId = parseInt(req.params.id);
  const updateData = { ...req.body };
  
  // Check if ad exists
  const existingAd = await prisma.advertisement.findUnique({
    where: { id: adId }
  });
  
  if (!existingAd) {
    throw createError('Ad not found', 404, 'AD_NOT_FOUND');
  }
  
  // Convert position to uppercase
  if (updateData.position) {
    updateData.position = updateData.position.toUpperCase();
  }
  
  // Convert date strings to Date objects
  if (updateData.startDate) {
    updateData.startDate = new Date(updateData.startDate);
  }
  if (updateData.endDate) {
    updateData.endDate = new Date(updateData.endDate);
  }
  
  const ad = await prisma.advertisement.update({
    where: { id: adId },
    data: updateData
  });
  
  res.json({
    message: 'Ad updated successfully',
    ad
  });
}));

// Delete ad (admin only)
router.delete('/:id', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN']), validateId, asyncHandler(async (req: AuthRequest, res) => {
  const adId = parseInt(req.params.id);
  
  const ad = await prisma.advertisement.findUnique({
    where: { id: adId }
  });
  
  if (!ad) {
    throw createError('Ad not found', 404, 'AD_NOT_FOUND');
  }
  
  await prisma.advertisement.delete({
    where: { id: adId }
  });
  
  res.json({
    message: 'Ad deleted successfully'
  });
}));

// Toggle ad status (admin only)
router.patch('/:id/toggle', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN']), validateId, asyncHandler(async (req: AuthRequest, res) => {
  const adId = parseInt(req.params.id);
  const { isActive } = req.body;
  
  if (typeof isActive !== 'boolean') {
    throw createError('isActive must be a boolean', 400, 'INVALID_STATUS');
  }
  
  const ad = await prisma.advertisement.update({
    where: { id: adId },
    data: { isActive }
  });
  
  res.json({
    message: 'Ad status updated successfully',
    ad
  });
}));

// Get ad statistics (admin only)
router.get('/:id/stats', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN']), validateId, asyncHandler(async (req: AuthRequest, res) => {
  const adId = parseInt(req.params.id);
  const days = parseInt(req.query.days as string) || 30;
  
  const ad = await prisma.advertisement.findUnique({
    where: { id: adId }
  });
  
  if (!ad) {
    throw createError('Ad not found', 404, 'AD_NOT_FOUND');
  }
  
  // Calculate CTR (Click Through Rate)
  const ctr = ad.impressions > 0 ? (ad.clicks / ad.impressions) * 100 : 0;
  
  res.json({
    ad: {
      id: ad.id,
      name: ad.name,
      position: ad.position
    },
    stats: {
      impressions: ad.impressions,
      clicks: ad.clicks,
      ctr: parseFloat(ctr.toFixed(2)),
      isActive: ad.isActive,
      createdAt: ad.createdAt,
      lastUpdated: ad.updatedAt
    }
  });
}));

// Get all ads statistics (admin only)
router.get('/stats/overview', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  const [
    totalAds,
    activeAds,
    totalImpressions,
    totalClicks,
    adsByPosition
  ] = await Promise.all([
    prisma.advertisement.count(),
    prisma.advertisement.count({
      where: { isActive: true }
    }),
    prisma.advertisement.aggregate({
      _sum: { impressions: true }
    }),
    prisma.advertisement.aggregate({
      _sum: { clicks: true }
    }),
    prisma.advertisement.groupBy({
      by: ['position'],
      _count: { position: true },
      _sum: {
        impressions: true,
        clicks: true
      }
    })
  ]);
  
  const overallCTR = totalImpressions._sum.impressions && totalImpressions._sum.impressions > 0
    ? (totalClicks._sum.clicks || 0) / totalImpressions._sum.impressions * 100
    : 0;
  
  const positionStats = adsByPosition.map(pos => ({
    position: pos.position,
    count: pos._count.position,
    impressions: pos._sum.impressions || 0,
    clicks: pos._sum.clicks || 0,
    ctr: pos._sum.impressions && pos._sum.impressions > 0
      ? (pos._sum.clicks || 0) / pos._sum.impressions * 100
      : 0
  }));
  
  res.json({
    overview: {
      totalAds,
      activeAds,
      totalImpressions: totalImpressions._sum.impressions || 0,
      totalClicks: totalClicks._sum.clicks || 0,
      overallCTR: parseFloat(overallCTR.toFixed(2))
    },
    byPosition: positionStats
  });
}));

// Bulk operations (admin only)
router.post('/bulk', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  const { action, adIds } = req.body;
  
  if (!adIds || !Array.isArray(adIds) || adIds.length === 0) {
    throw createError('Ad IDs are required', 400, 'MISSING_AD_IDS');
  }
  
  let result;
  
  switch (action) {
    case 'delete':
      result = await prisma.advertisement.deleteMany({
        where: { id: { in: adIds } }
      });
      break;
      
    case 'activate':
      result = await prisma.advertisement.updateMany({
        where: { id: { in: adIds } },
        data: { isActive: true }
      });
      break;
      
    case 'deactivate':
      result = await prisma.advertisement.updateMany({
        where: { id: { in: adIds } },
        data: { isActive: false }
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