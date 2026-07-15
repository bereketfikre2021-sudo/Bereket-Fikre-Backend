const { Router } = require('express');
const {
  getProjects, getProject,
  createProject, updateProject, deleteProject,
  duplicateProject,
  addGalleryImage, deleteGalleryImage,
  reorderProjects,
} = require('../controllers/project.controller');
const { authenticate }  = require('../middleware/auth');
const validate          = require('../middleware/validate');
const { createProjectRules, updateProjectRules, listRules } = require('../validators/project.validator');
const { upload }        = require('../services/upload.service');

const router = Router();

const uploadThumb   = upload('thumbnail', 'FEATURED_PROJECTS');
const uploadGallery = upload('image',     'FEATURED_PROJECTS');

// ——— Public ———
router.get('/',          listRules, validate, getProjects);
router.get('/:idOrSlug', getProject);

// ——— Protected ———
router.post('/',              authenticate, ...uploadThumb, createProjectRules, validate, createProject);
router.put('/reorder',        authenticate, reorderProjects);
router.post('/:id/duplicate', authenticate, duplicateProject);
router.put('/:id',            authenticate, ...uploadThumb, updateProjectRules, validate, updateProject);
router.delete('/:id',         authenticate, deleteProject);

// Inline thumbnail-only update
router.put('/:id/thumbnail', authenticate, ...uploadThumb, updateProject);

// Gallery images
router.post('/:id/gallery',            authenticate, ...uploadGallery, addGalleryImage);
router.delete('/:id/gallery/:imageId', authenticate, deleteGalleryImage);

module.exports = router;
