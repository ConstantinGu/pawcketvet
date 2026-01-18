const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', invoiceController.getAll);
router.post('/', invoiceController.create);
router.put('/:id', invoiceController.update);
router.patch('/:id/pay', invoiceController.markAsPaid);
router.delete('/:id', invoiceController.delete);

module.exports = router;
