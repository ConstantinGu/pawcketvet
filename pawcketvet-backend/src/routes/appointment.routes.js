const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', appointmentController.getAll);
router.post('/', appointmentController.create);
router.put('/:id', appointmentController.update);
router.delete('/:id', appointmentController.delete);
router.patch('/:id/status', appointmentController.updateStatus);
router.post('/:id/complete', appointmentController.completeWithConsultation);

module.exports = router;
