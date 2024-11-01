const express = require('express');
const { addColumn } = require('../controllers/newColumnController');
const router = express.Router();

router.post('/', addColumn);

module.exports = router;
