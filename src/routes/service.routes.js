const { Router } = require('express');
const {
  getServices, getService,
  createService, updateService, deleteService,
  updateServiceProcess,
  addGalleryImage, deleteGalleryImage,
  reorderServices,
} = require('../controllers/service.controller');
const { authenticate }  = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/rateLimiter');
const validate          = require('../middleware/validate');
const { serviceRules, processRules } = require('../validators/service.validator');
const { upload }        = require('../services/upload.service');

const router = Router();

// Featured image + gallery images → bereketfikre/services/
const uploadFeatured = [uploadLimiter, ...upload('featuredImage', 'SERVICES')];
const uploadGallery  = [uploadLimiter, ...upload('image',         'SERVICES')];

// ——— Public ———
router.get('/',          getServices);
router.get('/:idOrSlug', getService);

// ——— Protected ———
router.post('/',       authenticate, ...uploadFeatured, serviceRules, validate, createService);
router.put('/reorder', authenticate, reorderServices);
router.put('/:id',     authenticate, ...uploadFeatured, serviceRules, validate, updateService);
router.delete('/:id',  authenticate, deleteService);

// Process steps
router.put('/:id/process', authenticate, processRules, validate, updateServiceProcess);

// Gallery
router.post('/:id/gallery',            authenticate, ...uploadGallery, addGalleryImage);
router.delete('/:id/gallery/:imageId', authenticate, deleteGalleryImage);

module.exports = router;
