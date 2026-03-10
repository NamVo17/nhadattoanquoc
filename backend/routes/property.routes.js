const express = require('express');
const { body } = require('express-validator');
const propertyController = require('../controllers/property.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');
const router = express.Router();

// Validation rules
const propertyValidation = [
  body('title')
    .trim()
    .isLength({ min: 10, max: 99 })
    .withMessage('Title must be between 10 and 99 characters'),
  body('description')
    .trim()
    .isLength({ min: 50 })
    .withMessage('Description must be at least 50 characters'),
  body('price')
    .isInt({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('area')
    .isFloat({ min: 0 })
    .withMessage('Area must be a positive number'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
  body('district')
    .trim()
    .notEmpty()
    .withMessage('District is required'),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('type')
    .isIn(['apartment', 'house', 'villa', 'land', 'commercial'])
    .withMessage('Invalid property type'),
];

// Public routes
router.get('/approved', propertyController.getApprovedProperties);
router.get('/:slug', propertyController.getProperty);

// Protected routes (require authentication)
router.use(authenticate);

// Agent/Moderator/Admin only routes
router.post('/', propertyValidation, propertyController.createProperty);
router.get('/agent/:agentId?', propertyController.getPropertiesByAgent);
router.put('/:id', propertyController.updateProperty);
router.delete('/:id', propertyController.deleteProperty);

// Image upload
router.post('/:id/images', upload.array('images', 20), propertyController.uploadImages);

// Admin only routes
router.get('/admin/all', propertyController.getAllProperties);
router.put('/:id/approve', propertyController.approveProperty);

module.exports = router;