const express = require('express');
const { body, param } = require('express-validator');
const collaborationController = require('../controllers/collaboration.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const router = express.Router();

// Validation rules
const acceptPropertyValidation = [
  body('propertyId')
    .notEmpty()
    .trim()
    .withMessage('Property ID is required'),
];

const updateStatusValidation = [
  param('collaborationId')
    .isUUID()
    .withMessage('Invalid collaboration ID'),
  body('status')
    .isIn(['active', 'inactive', 'completed'])
    .withMessage('Invalid status'),
];

// All routes require authentication
router.use(authenticate);

// Agent routes - POST first
// POST /api/v1/collaborations/accept - Accept property for collaboration
router.post(
  '/accept',
  authorize('agent', 'admin'),
  acceptPropertyValidation,
  collaborationController.acceptProperty
);

// POST /api/v1/collaborations/:collaborationId/mark-as-sold - Mark property as sold
router.post(
  '/:collaborationId/mark-as-sold',
  authorize('agent', 'admin'),
  collaborationController.markAsSold
);

// POST /api/v1/collaborations/:collaborationId/confirm-sold - Confirm property as sold (owner only)
router.post(
  '/:collaborationId/confirm-sold',
  authorize('agent', 'admin'),
  collaborationController.confirmSold
);

// POST /api/v1/collaborations/:collaborationId/cancel - Cancel collaboration
router.post(
  '/:collaborationId/cancel',
  authorize('agent', 'admin'),
  collaborationController.cancelCollaboration
);

// GET routes - specific paths BEFORE parameters
// GET /api/v1/collaborations/my - Get all collaborations for current agent
router.get(
  '/my',
  authorize('agent', 'admin'),
  collaborationController.getMyCollaborations
);

// GET /api/v1/collaborations/my-properties - Get properties owned by current user with collaborations
router.get(
  '/my-properties',
  authorize('agent', 'admin'),
  collaborationController.getMyPropertiesWithCollaborations
);

// Admin only - /property/:id MUST come before /:id
// GET /api/v1/collaborations/property/:propertyId - Get all agents collaborating on property
router.get(
  '/property/:propertyId',
  authorize('admin', 'moderator'),
  collaborationController.getPropertyCollaborators
);

// GET parameter routes
// GET /api/v1/collaborations/:collaborationId - Get collaboration details
router.get(
  '/:collaborationId',
  authorize('agent', 'admin'),
  collaborationController.getCollaborationDetails
);

// PATCH /api/v1/collaborations/:collaborationId/status - Update collaboration status
router.patch(
  '/:collaborationId/status',
  authorize('agent', 'admin'),
  updateStatusValidation,
  collaborationController.updateCollaborationStatus
);

// DELETE /api/v1/collaborations/:collaborationId - End collaboration
router.delete(
  '/:collaborationId',
  authorize('agent', 'admin'),
  collaborationController.endCollaboration
);

module.exports = router;
