const Collaboration = require('../models/collaboration.model');
const Property = require('../models/property.model');
const { validationResult } = require('express-validator');
const NotificationModel = require('../models/notification.model');

// Accept property for collaboration (agent nhận bán)
exports.acceptProperty = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { propertyId } = req.body;
    const agentId = req.user.id;

    // Check if property exists
    const property = await Property.getById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    // Check if agent already accepted this property
    const exists = await Collaboration.exists(propertyId, agentId);
    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'You already accepted this property',
      });
    }

    // Create collaboration record
    const collaboration = await Collaboration.create({
      property_id: propertyId,
      agent_id: agentId,
      commission_rate: property.commission || 1.0,
    });

    // Notify the accepting agent
    NotificationModel.create(
      agentId,
      'collaboration_sent',
      'Nhận bán bất động sản',
      `Bạn đã nhận bán bất động sản "${property.title}". Hoa hồng: ${property.commission || 1}%.`,
      { propertyId, collaborationId: collaboration.id }
    ).catch(() => {});

    // Notify the property owner
    if (property.agentid !== agentId) {
      NotificationModel.create(
        property.agentid,
        'collaboration_received',
        'BĐS của bạn được nhận bán',
        `Bất động sản "${property.title}" của bạn đã có môi giới nhận bán.`,
        { propertyId, collaborationId: collaboration.id }
      ).catch(() => {});
    }

    return res.status(201).json({
      success: true,
      message: 'Property accepted successfully',
      data: collaboration,
    });
  } catch (error) {
    console.error('Error in acceptProperty:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to accept property',
      error: error.message,
    });
  }
};

// Get all collaborations for current agent
exports.getMyCollaborations = async (req, res) => {
  try {
    const agentId = req.user.id;
    const { status } = req.query;

    const collaborations = await Collaboration.getByAgentId(agentId, status);

    return res.status(200).json({
      success: true,
      message: 'Collaborations fetched successfully',
      data: collaborations,
    });
  } catch (error) {
    console.error('Error in getMyCollaborations:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch collaborations',
      error: error.message,
    });
  }
};

// Get all agents collaborating on a property (admin only)
exports.getPropertyCollaborators = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const collaborations = await Collaboration.getByPropertyId(propertyId);

    return res.status(200).json({
      success: true,
      message: 'Property collaborators fetched successfully',
      data: collaborations,
    });
  } catch (error) {
    console.error('Error in getPropertyCollaborators:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch property collaborators',
      error: error.message,
    });
  }
};

// Get collaboration details
exports.getCollaborationDetails = async (req, res) => {
  try {
    const { collaborationId } = req.params;
    const agentId = req.user.id;

    const collaboration = await Collaboration.getById(collaborationId);
    if (!collaboration) {
      return res.status(404).json({
        success: false,
        message: 'Collaboration not found',
      });
    }

    // Check authorization (only agent who created this collaboration can view)
    if (collaboration.agent_id !== agentId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this collaboration',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Collaboration details fetched successfully',
      data: collaboration,
    });
  } catch (error) {
    console.error('Error in getCollaborationDetails:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch collaboration details',
      error: error.message,
    });
  }
};

// Update collaboration status
exports.updateCollaborationStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { collaborationId } = req.params;
    const { status } = req.body;
    const agentId = req.user.id;

    // Check if collaboration exists
    const collaboration = await Collaboration.getById(collaborationId);
    if (!collaboration) {
      return res.status(404).json({
        success: false,
        message: 'Collaboration not found',
      });
    }

    // Check authorization
    if (collaboration.agent_id !== agentId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this collaboration',
      });
    }

    // Update status
    const updated = await Collaboration.updateStatus(
      collaborationId,
      status,
      status === 'completed' ? new Date() : null
    );

    return res.status(200).json({
      success: true,
      message: 'Collaboration status updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Error in updateCollaborationStatus:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update collaboration status',
      error: error.message,
    });
  }
};

// End collaboration
exports.endCollaboration = async (req, res) => {
  try {
    const { collaborationId } = req.params;
    const agentId = req.user.id;

    // Check if collaboration exists
    const collaboration = await Collaboration.getById(collaborationId);
    if (!collaboration) {
      return res.status(404).json({
        success: false,
        message: 'Collaboration not found',
      });
    }

    // Check authorization
    if (collaboration.agent_id !== agentId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to end this collaboration',
      });
    }

    // End collaboration
    const ended = await Collaboration.delete(collaborationId);

    return res.status(200).json({
      success: true,
      message: 'Collaboration ended successfully',
      data: ended,
    });
  } catch (error) {
    console.error('Error in endCollaboration:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to end collaboration',
      error: error.message,
    });
  }
};

// Get properties owned by current user with collaborations (property owners view)
exports.getMyPropertiesWithCollaborations = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { status } = req.query;

    const collaborations = await Collaboration.getPropertiesByOwnerId(ownerId, status);

    return res.status(200).json({
      success: true,
      message: 'Properties with collaborations fetched successfully',
      data: collaborations,
    });
  } catch (error) {
    console.error('Error in getMyPropertiesWithCollaborations:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch properties with collaborations',
      error: error.message,
    });
  }
};

// Mark collaboration as sold (selling agent marks as đã bán)
exports.markAsSold = async (req, res) => {
  try {
    const { collaborationId } = req.params;
    const agentId = req.user.id;

    // Check if collaboration exists
    const collaboration = await Collaboration.getById(collaborationId);
    if (!collaboration) {
      return res.status(404).json({
        success: false,
        message: 'Collaboration not found',
      });
    }

    // Check authorization (only the selling agent can mark as sold)
    if (collaboration.agent_id !== agentId) {
      return res.status(403).json({
        success: false,
        message: 'Only the selling agent can mark as sold',
      });
    }

    // Mark as sold
    const updated = await Collaboration.markAsSold(collaborationId, agentId);

    return res.status(200).json({
      success: true,
      message: 'Property marked as sold, awaiting owner confirmation',
      data: updated,
    });
  } catch (error) {
    console.error('Error in markAsSold:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark as sold',
      error: error.message,
    });
  }
};

// Confirm sold (property owner confirms the sale)
exports.confirmSold = async (req, res) => {
  try {
    const { collaborationId } = req.params;
    const ownerId = req.user.id;

    // Check if collaboration exists
    const collaboration = await Collaboration.getById(collaborationId);
    if (!collaboration) {
      return res.status(404).json({
        success: false,
        message: 'Collaboration not found',
      });
    }

    // Check if property exists
    const property = await Property.getById(collaboration.property_id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    // Check authorization (only the property owner can confirm)
    if (property.agentid !== ownerId) {
      return res.status(403).json({
        success: false,
        message: 'Only the property owner can confirm the sale',
      });
    }

    // Confirm sold and update property status
    const updated = await Collaboration.confirmSold(collaborationId, ownerId);

    // Update property status to sold
    await Property.update(collaboration.property_id, { status: 'sold' });

    // Notify selling agent about commission
    const commissionAmount = property.price * (collaboration.commission_rate || 1) / 100;
    NotificationModel.create(
      collaboration.agent_id,
      'commission_received',
      'Nhận hoa hồng',
      `Giao dịch "${property.title}" đã hoàn tất. Hoa hồng dự kiến: ${commissionAmount.toLocaleString('vi-VN')} VNĐ.`,
      { propertyId: collaboration.property_id, collaborationId, amount: commissionAmount }
    ).catch(() => {});

    return res.status(200).json({
      success: true,
      message: 'Sale confirmed successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Error in confirmSold:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to confirm sale',
      error: error.message,
    });
  }
};

// Cancel collaboration (either party cancels)
exports.cancelCollaboration = async (req, res) => {
  try {
    const { collaborationId } = req.params;
    const userId = req.user.id;

    // Check if collaboration exists
    const collaboration = await Collaboration.getById(collaborationId);
    if (!collaboration) {
      return res.status(404).json({
        success: false,
        message: 'Collaboration not found',
      });
    }

    // Check authorization (selling agent can always cancel, owner can only cancel if pending-confirmation)
    if (collaboration.agent_id === userId) {
      // Selling agent can always cancel
    } else {
      // Property owner can only cancel if pending-confirmation (rejecting the sale)
      const property = await Property.getById(collaboration.property_id);
      if (property.agentid !== userId || collaboration.status !== 'pending-confirmation') {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to cancel this collaboration',
        });
      }
    }

    // Cancel collaboration
    const cancelled = await Collaboration.cancel(collaborationId);

    return res.status(200).json({
      success: true,
      message: 'Collaboration cancelled successfully',
      data: cancelled,
    });
  } catch (error) {
    console.error('Error in cancelCollaboration:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel collaboration',
      error: error.message,
    });
  }
};
