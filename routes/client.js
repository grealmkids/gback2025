const express = require("express");
const router = express.Router();
const {
  viewPurchasedAlbums,
  saveBillingAddress,
  getBillingAddress,
  createUserIfNotExists,
  getAllAlbums,
  downloadFile,
  getCategories,
  getProductsByCategory,
  getProductDetails,
  getHomepageServices,
  proxyPdf
} = require("../controllers/clientController");
const Album = require("../models/album");
const PurchasedItem = require("../models/PurchasedItem");

// View purchased albums
router.get("/purchased-albums", viewPurchasedAlbums);

// Route for fetching all albums with optional status filter
router.get("/albums", getAllAlbums);

// Proxy route for file downloads
router.get("/download", downloadFile);

// Route to fetch details of a specific album by ID
router.get("/albums/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const album = await Album.findByPk(id);

    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    res.status(200).json(album);
  } catch (error) {
    console.error(`Error fetching album with ID ${id}:`, error);
    res.status(500).json({ message: "Failed to fetch album details", error });
  }
});

router.post("/insert-client-album", async (req, res) => {
  const { userId, albumId } = req.body;

  if (!userId || !albumId) {
    return res
      .status(400)
      .json({ message: "userId and albumId are required." });
  }

  try {
    await PurchasedItem.create({
      userId,
      productId: albumId,
      productType: 'Albums',
      paymentStatus: 'COMPLETED',
      paymentReference: 'MANUAL_INSERT'
    });
    res
      .status(201)
      .json({ message: "Purchased item row inserted successfully." });
  } catch (error) {
    console.error("Error inserting purchased item:", error);
    res
      .status(500)
      .json({ message: "Failed to insert purchased item.", error });
  }
});

// Billing address routes
router.post("/billing-address", saveBillingAddress);
router.get("/billing-address", getBillingAddress);

// User management routes
router.post("/create-user", createUserIfNotExists);

const { getCart, addToCart, updateQuantity, removeFromCart } = require("../controllers/cartController");
const { initiateCheckout, verifyPaymentStatus } = require("../controllers/checkoutController");

// Dynamic Products Routes
router.get("/categories", getCategories);
router.get("/products/:categoryId", getProductsByCategory); // Fetch products by category ID
router.get("/products/:categoryId/details/:productId", getProductDetails); // Fetch specific product details

// Homepage
router.get('/services', getHomepageServices);

// Proxy PDF (Bypass CORS)
router.get('/proxy-pdf', proxyPdf);

// --- CART ROUTES ---
router.get("/cart", getCart);
router.post("/cart", addToCart);
router.patch("/cart/:cartItemId", updateQuantity);
router.delete("/cart/:cartItemId", removeFromCart);

// --- CHECKOUT & PESAPAL ROUTES ---
router.post("/checkout", initiateCheckout);
router.get("/checkout/verify", verifyPaymentStatus);

module.exports = router;
