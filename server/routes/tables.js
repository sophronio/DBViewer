// routes/tables.js
const express = require('express');
const { getTableNames } = require('../controllers/tablesController');
const router = express.Router();

// Route to get all table names
router.get('/', getTableNames);

module.exports = router;
