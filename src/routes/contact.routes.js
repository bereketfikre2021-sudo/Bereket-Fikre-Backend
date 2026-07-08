const { Router } = require('express');
const {
  submitContact, submitProjectRequest,
  getContacts, getContact, updateContactStatus, deleteContact,
  getProjectRequests, getProjectRequest, updateProjectRequestStatus, deleteProjectRequest,
} = require('../controllers/contact.controller');
const { authenticate } = require('../middleware/auth');
const { contactLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');
const { contactRules, projectRequestRules } = require('../validators/contact.validator');

const router = Router();

// ——— Public (rate limited) ———
// POST /api/contact   — matches frontend Contact.jsx form
router.post('/contact', contactLimiter, contactRules, validate, submitContact);

// POST /api/project-request   — matches frontend ProjectRequestModal.jsx form
router.post('/project-request', contactLimiter, projectRequestRules, validate, submitProjectRequest);

// ——— Protected (Admin) ———
// Contact submissions
router.get('/admin/contacts', authenticate, getContacts);
router.get('/admin/contacts/:id', authenticate, getContact);
router.put('/admin/contacts/:id/status', authenticate, updateContactStatus);
router.delete('/admin/contacts/:id', authenticate, deleteContact);

// Project requests
router.get('/admin/project-requests', authenticate, getProjectRequests);
router.get('/admin/project-requests/:id', authenticate, getProjectRequest);
router.put('/admin/project-requests/:id/status', authenticate, updateProjectRequestStatus);
router.delete('/admin/project-requests/:id', authenticate, deleteProjectRequest);

module.exports = router;
