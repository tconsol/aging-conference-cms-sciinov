const express = require('express');
const ctrl = require('../controllers/fontController');

const router = express.Router();

// Public: the client also needs the list to know a saved family is still valid.
router.get('/', ctrl.getFonts);

module.exports = router;
