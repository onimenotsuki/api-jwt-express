const express = require('express');
const router = express.Router();

// Cargamos nuestro controlador
const usersController = require('../controllers/users');

// Con el método POST, en el endpoint /signup
// podremos registrar a nuestro usuario
router.post('/signup', usersController.signup);

module.exports = router;
