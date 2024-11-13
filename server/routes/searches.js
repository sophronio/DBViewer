// routes/rows.js
const express = require('express');
const { getSearchData } = require('../controllers/searchController');
const router = express.Router();

// Route to get rows from a specific table
router.get('/:tableName', getSearchData);

module.exports = router;
