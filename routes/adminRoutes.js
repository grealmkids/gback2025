const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authenticateAdmin = require("../middleware/adminAuth");
const { upload } = require("../utils/b2Upload");

// All admin routes must be protected
router.use(authenticateAdmin);

// Dashboard routes
router.get("/products", adminController.getAllProducts);

// Product Creation with Multer for multiple files
// We will accept 'thumbnail', 'mainFile', 'videoFile', 'coloringBookFile', 'flashcardsFile'
router.post(
    "/products",
    upload.fields([
        { name: "thumbnail", maxCount: 1 },
        { name: "mainFile", maxCount: 1 },
        { name: "videoFile", maxCount: 1 },
        { name: "coloringBookFile", maxCount: 1 },
        { name: "flashcardsFile", maxCount: 1 },
    ]),
    adminController.createProduct
);

// Delete product
router.delete("/products/:type/:id", adminController.deleteUnifiedProduct);

// Expose router
module.exports = router;
