const express = require('express');
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth.middleware');
const newsController = require('../controllers/news.controller');
const { upload } = require('../middleware/upload.middleware');
const router = express.Router();

// Public routes (no auth required) - non-slug routes FIRST
router.get('/', newsController.getPublishedNews);

// Admin routes - all below this require authentication
router.use(authenticate);

// Test endpoint to verify auth is working
router.get('/test/auth', (req, res) => {
  res.json({
    success: true,
    message: 'Authentication is working',
    user: {
      id: req.user?.id,
      email: req.user?.email,
      role: req.user?.role,
      is_active: req.user?.is_active,
    },
  });
});

// Validation rules for news
const newsValidation = [
  body('title').trim().notEmpty().withMessage('Tiêu đề không được để trống'),
  body('summary').trim().isLength({ min: 20 }).withMessage('Tóm tắt tối thiểu 20 ký tự'),
  body('content').trim().isLength({ min: 50 }).withMessage('Nội dung tối thiểu 50 ký tự'),
  body('status').optional().isIn(['draft', 'published']).withMessage('Trạng thái không hợp lệ'),
];

// Image upload route - MUST come before other POST routes to avoid conflicts
router.post('/upload/image', upload.single('file'), newsController.uploadNewsImage);

// Admin CRUD routes - defined BEFORE :slug route
router.get('/admin/list', newsController.adminGetNews);
router.post('/admin', newsValidation, newsController.createNews);
router.put('/admin/:id', newsValidation, newsController.updateNews);
router.delete('/admin/:id', newsController.deleteNews);

// Public route for individual news by slug - LAST (catch-all)
router.get('/:slug', newsController.getNewsBySlug);

module.exports = router;

