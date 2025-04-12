const express = require("express");
const router = express.Router();
const { viewPurchasedAlbums } = require("../controllers/clientController");

/**
 * @swagger
 * /client/purchased-albums:
 *   get:
 *     summary: View purchased albums
 *     description: Retrieve a list of albums purchased by the client.
 *     responses:
 *       200:
 *         description: List of purchased albums
 *       401:
 *         description: Unauthorized
 */
// View purchased albums
router.get("/purchased-albums", viewPurchasedAlbums);

module.exports = router;
