const express = require("express");
const router = express.Router();
const { addClient, addAlbum } = require("../controllers/adminController");

// Add new client
router.post("/add-client", addClient);

// Add new album
router.post("/add-album", addAlbum);

module.exports = router;
