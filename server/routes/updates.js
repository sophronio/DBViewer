const express = require('express');
const { sendUpdates } = require('../controllers/updateController');
const router = express.Router();

router.put('/', sendUpdates);

module.exports = router;
