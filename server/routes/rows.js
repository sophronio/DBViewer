// routes/rows.js
const express = require("express");
const { getRowsFromTable } = require("../controllers/rowsController");
const router = express.Router();

// Route to get rows from a specific table
router.get("/:tableName", getRowsFromTable);

module.exports = router;
