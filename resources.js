const express = require('express');
const router = express.Router();

// API routing
router.use('/templates', require('./controllers'));

module.exports = router;
