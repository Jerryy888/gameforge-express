import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest, requireRole } from '@/middleware/auth';
import { asyncHandler, createError } from '@/middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(uploadsDir, getUploadSubdirectory(file.mimetype));
    
    // Create subdirectory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    'application/zip',
    'application/x-zip-compressed',
    'text/html',
    'application/javascript',
    'text/css',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ];
  
  const allowedExtensions = ['.zip', '.html', '.js', '.css', '.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed. Allowed types: ${allowedExtensions.join(', ')}`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800'), // 50MB default
    files: 5 // Maximum 5 files per request
  }
});

// Helper function to determine upload subdirectory
function getUploadSubdirectory(mimetype: string): string {
  if (mimetype.startsWith('image/')) {
    return 'images';
  } else if (mimetype.includes('zip')) {
    return 'games';
  } else if (mimetype.includes('html') || mimetype.includes('javascript') || mimetype.includes('css')) {
    return 'web';
  }
  return 'misc';
}

// Helper function to get file size in readable format
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Upload single file
router.post('/single', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN']), upload.single('file'), asyncHandler(async (req: AuthRequest, res) => {
  if (!req.file) {
    throw createError('No file uploaded', 400, 'NO_FILE_UPLOADED');
  }
  
  const { gameId } = req.body;
  const file = req.file;
  
  // Create file URL
  const fileUrl = `/uploads/${getUploadSubdirectory(file.mimetype)}/${file.filename}`;
  
  // Save file info to database
  const fileUpload = await prisma.fileUpload.create({
    data: {
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: file.path,
      url: fileUrl,
      gameId: gameId ? parseInt(gameId) : null,
      uploadedBy: req.admin!.username
    }
  });
  
  res.json({
    message: 'File uploaded successfully',
    file: {
      id: fileUpload.id,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      formattedSize: formatFileSize(file.size),
      mimeType: file.mimetype,
      url: fileUrl,
      uploadedAt: fileUpload.createdAt
    }
  });
}));

// Upload multiple files
router.post('/multiple', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN']), upload.array('files', 5), asyncHandler(async (req: AuthRequest, res) => {
  const files = req.files as Express.Multer.File[];
  
  if (!files || files.length === 0) {
    throw createError('No files uploaded', 400, 'NO_FILES_UPLOADED');
  }
  
  const { gameId } = req.body;
  
  // Process all files
  const uploadedFiles = await Promise.all(files.map(async (file) => {
    const fileUrl = `/uploads/${getUploadSubdirectory(file.mimetype)}/${file.filename}`;
    
    const fileUpload = await prisma.fileUpload.create({
      data: {
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
        url: fileUrl,
        gameId: gameId ? parseInt(gameId) : null,
        uploadedBy: req.admin!.username
      }
    });
    
    return {
      id: fileUpload.id,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      formattedSize: formatFileSize(file.size),
      mimeType: file.mimetype,
      url: fileUrl,
      uploadedAt: fileUpload.createdAt
    };
  }));
  
  res.json({
    message: 'Files uploaded successfully',
    files: uploadedFiles
  });
}));

// Get uploaded files list (admin only)
router.get('/', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const gameId = req.query.gameId ? parseInt(req.query.gameId as string) : undefined;
  
  const skip = (page - 1) * limit;
  
  const where: any = {};
  if (gameId) {
    where.gameId = gameId;
  }
  
  const [files, total] = await Promise.all([
    prisma.fileUpload.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.fileUpload.count({ where })
  ]);
  
  const formattedFiles = files.map(file => ({
    ...file,
    formattedSize: formatFileSize(file.size)
  }));
  
  res.json({
    files: formattedFiles,
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

// Delete uploaded file
router.delete('/:id', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  const fileId = parseInt(req.params.id);
  
  const fileUpload = await prisma.fileUpload.findUnique({
    where: { id: fileId }
  });
  
  if (!fileUpload) {
    throw createError('File not found', 404, 'FILE_NOT_FOUND');
  }
  
  // Delete physical file
  if (fs.existsSync(fileUpload.path)) {
    fs.unlinkSync(fileUpload.path);
  }
  
  // Delete from database
  await prisma.fileUpload.delete({
    where: { id: fileId }
  });
  
  res.json({
    message: 'File deleted successfully'
  });
}));

// Get file info
router.get('/:id', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  const fileId = parseInt(req.params.id);
  
  const fileUpload = await prisma.fileUpload.findUnique({
    where: { id: fileId }
  });
  
  if (!fileUpload) {
    throw createError('File not found', 404, 'FILE_NOT_FOUND');
  }
  
  res.json({
    ...fileUpload,
    formattedSize: formatFileSize(fileUpload.size),
    exists: fs.existsSync(fileUpload.path)
  });
}));

// Upload game file (specialized endpoint)
router.post('/game', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN']), upload.single('file'), asyncHandler(async (req: AuthRequest, res) => {
  if (!req.file) {
    throw createError('No game file uploaded', 400, 'NO_FILE_UPLOADED');
  }
  
  const file = req.file;
  const { gameId } = req.body;
  
  // Validate file type for games
  const allowedGameTypes = ['application/zip', 'application/x-zip-compressed', 'text/html'];
  if (!allowedGameTypes.includes(file.mimetype)) {
    // Delete uploaded file
    fs.unlinkSync(file.path);
    throw createError('Invalid game file type. Only ZIP and HTML files are allowed.', 400, 'INVALID_GAME_FILE');
  }
  
  const fileUrl = `/uploads/games/${file.filename}`;
  
  // Save to database
  const fileUpload = await prisma.fileUpload.create({
    data: {
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: file.path,
      url: fileUrl,
      gameId: gameId ? parseInt(gameId) : null,
      uploadedBy: req.admin!.username
    }
  });
  
  // If gameId provided, update the game's fileUrl
  if (gameId) {
    await prisma.game.update({
      where: { id: parseInt(gameId) },
      data: { 
        fileUrl,
        fileSize: formatFileSize(file.size)
      }
    });
  }
  
  res.json({
    message: 'Game file uploaded successfully',
    fileUrl,
    fileSize: formatFileSize(file.size),
    file: {
      id: fileUpload.id,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      formattedSize: formatFileSize(file.size),
      url: fileUrl
    }
  });
}));

// Upload image (specialized endpoint for thumbnails/screenshots)
router.post('/image', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN']), upload.single('image'), asyncHandler(async (req: AuthRequest, res) => {
  if (!req.file) {
    throw createError('No image uploaded', 400, 'NO_IMAGE_UPLOADED');
  }
  
  const file = req.file;
  
  // Validate file type for images
  if (!file.mimetype.startsWith('image/')) {
    // Delete uploaded file
    fs.unlinkSync(file.path);
    throw createError('Invalid image file type', 400, 'INVALID_IMAGE_FILE');
  }
  
  const imageUrl = `/uploads/images/${file.filename}`;
  
  // Save to database
  const fileUpload = await prisma.fileUpload.create({
    data: {
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: file.path,
      url: imageUrl,
      uploadedBy: req.admin!.username
    }
  });
  
  res.json({
    message: 'Image uploaded successfully',
    imageUrl,
    image: {
      id: fileUpload.id,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      formattedSize: formatFileSize(file.size),
      url: imageUrl
    }
  });
}));

// Get upload statistics (admin only)
router.get('/stats/overview', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  const [
    totalFiles,
    totalSize,
    filesByType,
    recentUploads
  ] = await Promise.all([
    prisma.fileUpload.count(),
    prisma.fileUpload.aggregate({
      _sum: { size: true }
    }),
    prisma.fileUpload.groupBy({
      by: ['mimeType'],
      _count: { mimeType: true },
      _sum: { size: true }
    }),
    prisma.fileUpload.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        filename: true,
        originalName: true,
        size: true,
        mimeType: true,
        uploadedBy: true,
        createdAt: true
      }
    })
  ]);
  
  const typeStats = filesByType.map(type => ({
    mimeType: type.mimeType,
    count: type._count.mimeType,
    totalSize: type._sum.size || 0,
    formattedSize: formatFileSize(type._sum.size || 0)
  }));
  
  const recentUploadsFormatted = recentUploads.map(upload => ({
    ...upload,
    formattedSize: formatFileSize(upload.size)
  }));
  
  res.json({
    overview: {
      totalFiles,
      totalSize: totalSize._sum.size || 0,
      formattedTotalSize: formatFileSize(totalSize._sum.size || 0)
    },
    byType: typeStats,
    recentUploads: recentUploadsFormatted
  });
}));

export default router;