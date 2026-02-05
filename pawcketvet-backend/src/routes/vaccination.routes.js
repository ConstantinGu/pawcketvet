const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const vaccinationController = require('../controllers/vaccination.controller');

router.get('/upcoming', authMiddleware, vaccinationController.getUpcoming);
router.get('/animal/:animalId', authMiddleware, vaccinationController.getByAnimal);
router.post('/', authMiddleware, vaccinationController.create);
router.put('/:id', authMiddleware, vaccinationController.update);
router.delete('/:id', authMiddleware, vaccinationController.delete);

module.exports = router;
