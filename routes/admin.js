const express = require("express");
const router = express.Router();
const {
  addClient,
  addAlbum,
  createAlbum,
  updateAlbum,
  deleteAlbum,
} = require("../controllers/adminController");

// Add new client
router.post("/add-client", addClient);

// Add new album
router.post("/add-album", addAlbum);

// Album management routes
router.post("/album", createAlbum);
router.put("/album/:id", updateAlbum);
router.delete("/album/:id", deleteAlbum);

module.exports = router;
