const express = require("express");
const router = express.Router();
const { addClient, addAlbum } = require("../controllers/adminController");

/**
 * @swagger
 * /admin/add-client:
 *   post:
 *     summary: Add a new client
 *     description: Add a new client to the system.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               country:
 *                 type: string
 *     responses:
 *       201:
 *         description: Client added successfully
 *       400:
 *         description: Bad request
 */

// Add new client
router.post("/add-client", addClient);

/**
 * @swagger
 * /admin/add-album:
 *   post:
 *     summary: Add a new album
 *     description: Add a new album to the system.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Album added successfully
 *       400:
 *         description: Bad request
 */

// Add new album
router.post("/add-album", addAlbum);

module.exports = router;
