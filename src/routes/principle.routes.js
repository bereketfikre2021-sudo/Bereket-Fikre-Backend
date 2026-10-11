const { Router } = require('express');
const {
  getPrinciples, getPrinciple, createPrinciple, updatePrinciple, deletePrinciple, reorderPrinciples,
} = require('../controllers/principle.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { principleRules, reorderRules } = require('../validators/principle.validator');

const router = Router();

// ——— Public ———
router.get('/', getPrinciples);
router.get('/:id', getPrinciple);

// ——— Protected ———
router.post('/', authenticate, principleRules, validate, createPrinciple);
router.put('/reorder', authenticate, reorderRules, validate, reorderPrinciples);
router.put('/:id', authenticate, principleRules, validate, updatePrinciple);
router.delete('/:id', authenticate, deletePrinciple);

module.exports = router;
