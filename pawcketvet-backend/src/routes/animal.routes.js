const express = require('express');
const router = express.Router();
const animalController = require('../controllers/animal.controller');
const { authMiddleware } = require('../middleware/auth');

// Toutes les routes nécessitent l'authentification
router.use(authMiddleware);

// Routes
router.get('/', animalController.getAll);
router.get('/:id', animalController.getById);
router.post('/', animalController.create);
router.put('/:id', animalController.update);
router.delete('/:id', animalController.delete);
router.post('/:id/weight', animalController.addWeight);

module.exports = router;
