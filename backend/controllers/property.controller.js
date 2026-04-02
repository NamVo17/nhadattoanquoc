const Property = require('../models/property.model');
const { validationResult } = require('express-validator');
const { supabaseAdmin } = require('../config/db.config');

// Create property
exports.createProperty = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    let {
      title,
      description,
      price,
      area,
      address,
      district,
      city,
      type,
      projectName, // camelCase from frontend
      projectname, // fallback for lowercase
      images = [],
      videoUrl, // camelCase from frontend
      videourl, // fallback for lowercase
      commission = 1,
      package: packageType = 'free',
      bedrooms,
      direction,
      mapurl,
    } = req.body;

    // Normalize field names
    const projectname_final = projectName || projectname;
    const videourl_final = videoUrl || videourl;

    // Get agent ID from authenticated user
    const agentId = req.user.id;

    // Generate slug
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Create property
    const propertyData = {
      title,
      slug: `${slug}-${Date.now()}`,
      description,
      price: typeof price === 'number' ? price : parseInt(price, 10),
      area: typeof area === 'number' ? area : parseFloat(area),
      address,
      district,
      city,
      type,
      projectname: projectname_final,
      images,
      videourl: videourl_final,
      commission: typeof commission === 'number' ? commission : parseFloat(commission),
      package: packageType,
      agentid: agentId,
      status: 'for-sale',
      isactive: true,
      isapproved: packageType === 'free',
      ...(bedrooms != null && { bedrooms: parseInt(bedrooms, 10) }),
      ...(direction != null && direction !== '' && { direction: String(direction).trim() }),
      ...(mapurl != null && mapurl !== '' && { mapurl: String(mapurl).trim() }),
    };

    const property = await Property.create(propertyData);

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      data: property,
    });
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create property',
      error: error.message,
    });
  }
};

// Get all properties (for admin)
exports.getAllProperties = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      type,
      city,
      district,
      agentId,
      isApproved,
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabaseAdmin
      .from('properties')
      .select(`
        *,
        agent:users(id, name, email, phone)
      `)
      .order('createdat', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (status) query = query.eq('status', status);
    if (type) query = query.eq('type', type);
    if (city) query = query.ilike('city', `%${city}%`);
    if (district) query = query.ilike('district', `%${district}%`);
    if (agentId) query = query.eq('agentid', agentId);
    if (isApproved !== undefined) query = query.eq('isapproved', isApproved === 'true');

    const { data: properties, error, count } = await query;

    if (error) {
      console.error('Error fetching properties:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch properties',
      });
    }

    res.json({
      success: true,
      data: properties,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error in getAllProperties:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get available properties for agent to accept (excluding already collaborated ones)
exports.getAvailableProperties = async (req, res) => {
  try {
    const agentId = req.user.id;
    const { type, city } = req.query;

    const properties = await Property.findAvailable(agentId, { type, city });

    res.json({
      success: true,
      data: properties,
    });
  } catch (error) {
    console.error('Error fetching available properties:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available properties',
    });
  }
};

// Get properties by agent
exports.getPropertiesByAgent = async (req, res) => {
  try {
    const agentId = req.params.agentId || req.user.id;
    const { status, type } = req.query;

    const properties = await Property.findByAgent(agentId, { status, type });

    res.json({
      success: true,
      data: properties,
    });
  } catch (error) {
    console.error('Error fetching agent properties:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch properties',
    });
  }
};

// Get single property
exports.getProperty = async (req, res) => {
  try {
    const { slug } = req.params;

    const property = await Property.findBySlug(slug);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    // Increment view count if not agent viewing their own property
    if (req.user?.id !== property.agentid) {
      await Property.incrementViewCount(property.id);
    }

    res.json({
      success: true,
      data: property,
    });
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch property',
    });
  }
};

// Get approved properties (public)
exports.getApprovedProperties = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      city,
      district,
      type,
      status = 'for-sale',
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      bedrooms,
      direction,
    } = req.query;

    const filters = {
      search: search ? String(search).trim() : undefined,
      city,
      district,
      type,
      status,
      minPrice: minPrice ? parseInt(minPrice) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
      minArea: minArea ? parseFloat(minArea) : undefined,
      maxArea: maxArea ? parseFloat(maxArea) : undefined,
      bedrooms: bedrooms != null && bedrooms !== '' ? parseInt(bedrooms, 10) : undefined,
      direction: direction ? String(direction).trim() : undefined,
    };

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { data: properties, total } = await Property.findApproved(filters, parseInt(limit), offset);

    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    res.json({
      success: true,
      data: properties,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: total ?? 0,
        pages: Math.ceil((total ?? 0) / limitNum) || 1,
      },
    });
  } catch (error) {
    console.error('Error fetching approved properties:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch properties',
    });
  }
};

// Update property
exports.updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    let updateData = req.body;
    const selectedPackage = updateData.package;

    // Normalize field names from camelCase to lowercase (as in database schema)
    const normalizedData = {};
    for (const [key, value] of Object.entries(updateData)) {
      if (key === 'projectName') {
        normalizedData['projectname'] = value;
      } else if (key === 'videoUrl') {
        normalizedData['videourl'] = value;
      } else if (key === 'mapUrl') {
        normalizedData['mapurl'] = value;
      } else {
        normalizedData[key] = value;
      }
    }
    updateData = normalizedData;

    // Check if user owns the property or is admin
    const { data: property } = await supabaseAdmin
      .from('properties')
      .select('agentid, package, package_expires_at, title')
      .eq('id', id)
      .single();

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    if (property.agentid !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // ─────────────────────────────────────────────────────────────────
    // Check if this is a renewal (expired package being renewed)
    // ─────────────────────────────────────────────────────────────────
    const isRenewing = property.package && property.package !== 'free' && property.package_expires_at;
    const hasExpiredPackage = isRenewing && new Date(property.package_expires_at) < new Date();
    const isSelectingPaidPackage = selectedPackage && ['vip', 'diamond'].includes(selectedPackage);

    // If renewing with a paid package, redirect to payment instead of updating
    if (hasExpiredPackage && isSelectingPaidPackage) {
      return res.json({
        success: true,
        message: 'Redirect to payment for renewal',
        requiresPayment: true,
        propertyId: id,
        package: selectedPackage,
        title: property.title,
      });
    }

    // For free package or non-renewal updates, proceed with normal update
    const updatedProperty = await Property.update(id, updateData);

    res.json({
      success: true,
      message: 'Property updated successfully',
      data: updatedProperty,
    });
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update property',
    });
  }
};

// Delete property (soft delete)
exports.deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: property } = await supabaseAdmin
      .from('properties')
      .select('agentid')
      .eq('id', id)
      .single();

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    if (property.agentid !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    await Property.delete(id);

    res.json({
      success: true,
      message: 'Property deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete property',
    });
  }
};

// Approve property (admin only)
exports.approveProperty = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const { id } = req.params;
    const { isApproved } = req.body;

    const updatedProperty = await Property.update(id, { isapproved: isApproved });

    res.json({
      success: true,
      message: `Property ${isApproved ? 'approved' : 'unapproved'} successfully`,
      data: updatedProperty,
    });
  } catch (error) {
    console.error('Error approving property:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve property',
    });
  }
};

// Upload property images
exports.uploadImages = async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
    }

    const { data: property } = await supabaseAdmin
      .from('properties')
      .select('agentid, images')
      .eq('id', id)
      .single();

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    if (property.agentid !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const uploadedUrls = [];
    const ext = (mime) => (mime && mime.split('/')[1]) || 'jpg';
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filePath = `${id}/${i}-${Date.now()}.${ext(file.mimetype)}`;

      const { error } = await supabaseAdmin.storage
        .from('property-images')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (error) {
        console.error('Error uploading image:', error);
        continue;
      }

      const { data: urlData } = supabaseAdmin.storage
        .from('property-images')
        .getPublicUrl(filePath);

      uploadedUrls.push(urlData.publicUrl);
    }

    const currentImages = Array.isArray(property.images) ? property.images : [];
    const updatedImages = [...currentImages, ...uploadedUrls];

    await Property.update(id, { images: updatedImages });

    res.json({
      success: true,
      message: 'Images uploaded successfully',
      data: {
        uploadedUrls,
        totalImages: updatedImages.length,
      },
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload images',
    });
  }
};