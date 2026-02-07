const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const prescriptionController = require('../controllers/prescription.controller');

router.get('/', authMiddleware, prescriptionController.getAll);
router.get('/medications', authMiddleware, prescriptionController.getMedications);
router.get('/:id', authMiddleware, prescriptionController.getById);
router.post('/', authMiddleware, prescriptionController.create);
router.post('/medications', authMiddleware, prescriptionController.createMedication);
router.put('/:id', authMiddleware, prescriptionController.update);
router.delete('/:id', authMiddleware, prescriptionController.delete);

module.exports = router;
