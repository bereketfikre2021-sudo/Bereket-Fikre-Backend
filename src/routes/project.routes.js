const { Router } = require('express');
const {
  getProjects, getProject,
  createProject, updateProject, deleteProject,
  addGalleryImage, deleteGalleryImage,
  reorderProjects,
} = require('../controllers/project.controller');
const { authenticate }  = require('../middleware/auth');
const validate          = require('../middleware/validate');
const { projectRules, listRules } = require('../validators/project.validator');
const { upload }        = require('../services/upload.service');

const router = Router();

// Thumbnail + gallery images both go to bereketfikre/featured-projects/
const uploadThumb   = upload('thumbnail', 'FEATURED_PROJECTS');
const uploadGallery = upload('image',     'FEATURED_PROJECTS');

// ——— Public ———
router.get('/',          listRules, validate, getProjects);
router.get('/:idOrSlug', getProject);

// ——— Protected ———
router.post('/',       authenticate, ...uploadThumb,   projectRules, validate, createProject);
router.put('/reorder', authenticate, reorderProjects);
router.put('/:id',     authenticate, ...uploadThumb,   projectRules, validate, updateProject);
router.delete('/:id',  authenticate, deleteProject);

// Inline thumbnail-only update (no validation rules — image field only)
router.put('/:id/thumbnail', authenticate, ...uploadThumb, updateProject);

// Gallery images
router.post('/:id/gallery',            authenticate, ...uploadGallery, addGalleryImage);
router.delete('/:id/gallery/:imageId', authenticate, deleteGalleryImage);

module.exports = router;
