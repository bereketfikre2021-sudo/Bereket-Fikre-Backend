const { Router } = require('express');
const {
  getCapabilities, getCapability, createCapability, updateCapability, deleteCapability, reorderCapabilities,
} = require('../controllers/capability.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { capabilityRules, reorderRules } = require('../validators/capability.validator');

const router = Router();

// ——— Public ———
router.get('/', getCapabilities);
router.get('/:id', getCapability);

// ——— Protected ———
router.post('/', authenticate, capabilityRules, validate, createCapability);
router.put('/reorder', authenticate, reorderRules, validate, reorderCapabilities);
router.put('/:id', authenticate, capabilityRules, validate, updateCapability);
router.delete('/:id', authenticate, deleteCapability);

module.exports = router;
