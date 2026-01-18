const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', inventoryController.getAll);
router.get('/alerts', inventoryController.getAlerts);
router.post('/', inventoryController.create);
router.put('/:id', inventoryController.update);
router.delete('/:id', inventoryController.delete);
router.post('/:id/adjust', inventoryController.adjustStock);

module.exports = router;
