const express = require("express");
const router = express.Router();
const { viewPurchasedAlbums } = require("../controllers/clientController");
const Album = require("../models/album");

// View purchased albums
router.get("/purchased-albums", viewPurchasedAlbums);

// Alias route for fetching all albums
router.get("/albums", async (req, res) => {
  try {
    const albums = await Album.findAll({
      attributes: { exclude: ["downloadUrl"] },
    });
    res.status(200).json(albums);
  } catch (error) {
    console.error("Error fetching albums at /api/albums:", error);
    res.status(500).json({ message: "Failed to fetch albums", error });
  }
});

module.exports = router;
