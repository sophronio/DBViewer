// routes/sqlTypes.js
const express = require('express');
const { getTypesFromDB } = require('../controllers/typesController');
const router = express.Router();

// Route to get rows from a specific table
router.get('/', getTypesFromDB);

module.exports = router;
