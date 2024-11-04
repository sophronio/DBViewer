const express = require('express');
const { addRow } = require('../controllers/newRowController');
const router = express.Router();

router.post('/', addRow);

module.exports = router;
