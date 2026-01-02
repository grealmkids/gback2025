const express = require('express');
const router = express.Router();
const homepageController = require('../controllers/homepageController');

router.get('/productions', homepageController.getProductions);
router.get('/services', homepageController.getServices);

module.exports = router;
