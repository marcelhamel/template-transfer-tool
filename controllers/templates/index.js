const express = require('express');
const router = express.Router();

const controller = require('./controller');

router.post('/', controller.importFromSailthru);
router.get('/', controller.getListFromSailthru);

module.exports = router;
