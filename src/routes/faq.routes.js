const { Router } = require('express');
const { getFaqs, getFaq, createFaq, updateFaq, deleteFaq, reorderFaqs } = require('../controllers/faq.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { faqRules, reorderRules } = require('../validators/faq.validator');

const router = Router();

// ——— Public ———
router.get('/', getFaqs);
router.get('/:id', getFaq);

// ——— Protected ———
router.post('/', authenticate, faqRules, validate, createFaq);
router.put('/reorder', authenticate, reorderRules, validate, reorderFaqs);
router.put('/:id', authenticate, faqRules, validate, updateFaq);
router.delete('/:id', authenticate, deleteFaq);

module.exports = router;
