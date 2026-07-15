const { Router } = require('express');
const {
  getPartners, getPartner, createPartner, updatePartner, deletePartner, reorderPartners,
  getTestimonials, getTestimonial, createTestimonial, updateTestimonial, deleteTestimonial, reorderTestimonials,
} = require('../controllers/partner.controller');
const { authenticate }  = require('../middleware/auth');
const validate          = require('../middleware/validate');
const { partnerRules, testimonialRules } = require('../validators/partner.validator');
const { upload }        = require('../services/upload.service');

const router = Router();

// Partner logos   → bereketfikre/trusted-partners/
// Profile images  → bereketfikre/testimonials/
const uploadLogo    = upload('logo',         'TRUSTED_PARTNERS');
const uploadProfile = upload('profileImage', 'TESTIMONIALS');

// ——— Partners — Public ———
router.get('/partners',    getPartners);
router.get('/partners/:id', getPartner);

// ——— Partners — Protected ———
router.post('/partners',         authenticate, ...uploadLogo,    partnerRules,     validate, createPartner);
router.put('/partners/reorder',  authenticate, reorderPartners);
router.put('/partners/:id',      authenticate, ...uploadLogo,    partnerRules,     validate, updatePartner);
router.delete('/partners/:id',   authenticate, deletePartner);

// Inline logo-only update (no validation rules)
router.put('/partners/:id/logo', authenticate, ...uploadLogo, updatePartner);

// ——— Testimonials — Public ———
router.get('/testimonials',    getTestimonials);
router.get('/testimonials/:id', getTestimonial);

// ——— Testimonials — Protected ———
router.post('/testimonials',            authenticate, ...uploadProfile, testimonialRules, validate, createTestimonial);
router.put('/testimonials/reorder',     authenticate, reorderTestimonials);
router.put('/testimonials/:id',         authenticate, ...uploadProfile, testimonialRules, validate, updateTestimonial);
router.delete('/testimonials/:id',      authenticate, deleteTestimonial);

// Inline profile-image-only update (no validation rules)
router.put('/testimonials/:id/image', authenticate, ...uploadProfile, updateTestimonial);

module.exports = router;
