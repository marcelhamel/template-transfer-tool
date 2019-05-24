const express = require('express');
const router = express.Router();

// Landing Page
router.use('/', require('./controllers/app'));

// API routing
router.use('/templates', require('./controllers/templates'));

module.exports = router;
