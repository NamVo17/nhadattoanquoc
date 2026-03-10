const News = require('../models/news.model');
const { validationResult } = require('express-validator');

// Helper to ensure admin role
const ensureAdmin = (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Access denied: admin only' });
    return false;
  }
  return true;
};

// Public: list published news
exports.getPublishedNews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (parseInt(page, 10) - 1) * limitNum;

    const items = await News.findPublished({ limit: limitNum, offset });

    res.json({
      success: true,
      data: items,
      pagination: {
        page: parseInt(page, 10),
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error('Error fetching published news:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch news' });
  }
};

// Public: get detail by slug
exports.getNewsBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const news = await News.findBySlug(slug);
    if (!news || news.status !== 'published') {
      return res.status(404).json({ success: false, message: 'News not found' });
    }
    res.json({ success: true, data: news });
  } catch (error) {
    console.error('Error fetching news by slug:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch news' });
  }
};

// Admin: list all
exports.adminGetNews = async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const limitNum = parseInt(limit, 10) || 20;
    const offset = (parseInt(page, 10) - 1) * limitNum;

    const { data, total } = await News.findAll({
      status,
      search: search ? String(search).trim() : undefined,
      limit: limitNum,
      offset,
    });

    res.json({
      success: true,
      data,
      pagination: {
        page: parseInt(page, 10),
        limit: limitNum,
        total,
        pages: Math.max(1, Math.ceil(total / limitNum)),
      },
    });
  } catch (error) {
    console.error('Error fetching admin news list:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch news list' });
  }
};

// Admin: create
exports.createNews = async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { title, category, summary, content, imageUrl, status = 'draft' } = req.body;
    const authorId = req.user.id;

    const news = await News.create({
      title,
      category,
      summary,
      content,
      image_url: imageUrl,
      status,
      authorid: authorId,
      published_at: status === 'published' ? new Date() : null,
    });

    res.status(201).json({ success: true, message: 'News created successfully', data: news });
  } catch (error) {
    console.error('Error creating news:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create news' });
  }
};

// Admin: update
exports.updateNews = async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const { id } = req.params;
    const { title, category, summary, content, imageUrl, status } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (category !== undefined) updates.category = category;
    if (summary !== undefined) updates.summary = summary;
    if (content !== undefined) updates.content = content;
    if (imageUrl !== undefined) updates.image_url = imageUrl;
    if (status !== undefined) {
      updates.status = status;
      if (status === 'published') {
        updates.published_at = new Date();
      }
    }

    const updated = await News.update(id, updates);
    res.json({ success: true, message: 'News updated successfully', data: updated });
  } catch (error) {
    console.error('Error updating news:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update news' });
  }
};

// Admin: delete
exports.deleteNews = async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const { id } = req.params;
    await News.delete(id);
    res.json({ success: true, message: 'News deleted successfully' });
  } catch (error) {
    console.error('Error deleting news:', error);
    res.status(500).json({ success: false, message: 'Failed to delete news' });
  }
};

// Admin: upload news image
exports.uploadNewsImage = async (req, res) => {
  if (!ensureAdmin(req, res)) return;
  
  try {
    console.log('=== NEWS IMAGE UPLOAD ===');
    console.log('User:', req.user?.id, 'Role:', req.user?.role);
    
    if (!req.file) {
      console.log('No file provided');
      return res.status(400).json({ success: false, message: 'Vui lòng chọn tệp ảnh' });
    }

    console.log('File received:', req.file.originalname, 'Size:', req.file.size, 'Type:', req.file.mimetype);

    const { supabaseAdmin } = require('../config/db.config');
    
    // Validate file type
    if (!req.file.mimetype.startsWith('image/')) {
      console.log('Invalid file type:', req.file.mimetype);
      return res.status(400).json({ success: false, message: 'Chỉ chọn tệp ảnh được phép' });
    }

    // Validate file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (req.file.size > MAX_SIZE) {
      console.log('File too large:', req.file.size);
      return res.status(400).json({ success: false, message: 'Ảnh không được vượt quá 5MB' });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = req.file.originalname.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `news-${timestamp}-${random}.${ext}`;
    const filePath = `news/${fileName}`;

    console.log(`Uploading to path: ${filePath}`);

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('news-images')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      
      // Check if bucket exists error
      if (error.message && error.message.includes('not found')) {
        console.error('Storage bucket "news-images" does not exist. Please create it in Supabase dashboard.');
        return res.status(500).json({ 
          success: false, 
          message: 'Kho lưu trữ ảnh chưa được cấu hình. Vui lòng liên hệ quản trị viên.',
        });
      }

      return res.status(500).json({ 
        success: false, 
        message: `Lỗi tải ảnh: ${error.message}`,
      });
    }

    console.log(`Upload successful, getting public URL...`);

    // Get public URL
    const { data: publicData } = supabaseAdmin.storage
      .from('news-images')
      .getPublicUrl(filePath);

    const publicUrl = publicData.publicUrl;
    console.log(`Public URL: ${publicUrl}`);

    res.json({
      success: true,
      message: 'Ảnh đã tải lên thành công',
      url: publicUrl,
    });
  } catch (error) {
    console.error('Lỗi trong uploadNewsImage:', error);
    res.status(500).json({ 
      success: false, 
      message: `Lỗi: ${error.message || 'Failed to upload image'}` 
    });
  }
};


