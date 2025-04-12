const express = require("express");
const router = express.Router();
const { viewPurchasedAlbums } = require("../controllers/clientController");

// View purchased albums
router.get("/purchased-albums", viewPurchasedAlbums);

module.exports = router;
