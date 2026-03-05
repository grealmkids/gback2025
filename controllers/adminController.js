const {
  User,
  Album,
  Video,
  Book,
  AfricanStory,
  Category,
  PurchasedItem,
} = require("../models");
const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");
const { body, validationResult } = require("express-validator");
const { uploadToB2 } = require("../utils/b2Upload");
const { generateAndSendOtp, validateOtp } = require("../utils/otpService");

const getModelByCategoryType = (type) => {
  switch (type) {
    case "COLLECTION":
    case "AUDIO":
      return Album;
    case "VIDEO MP4":
    case "VIDEO":
      return Video;
    case "PDF":
    case "BOOK":
      return Book;
    case "STORY":
    case "AFRICAN STORY":
      return AfricanStory;
    default:
      return null;
  }
};

// Add new client
exports.addClient = async (req, res) => {
  const { email, phone, purchasedAlbumTitle } = req.body;

  // Input validation
  if (!email || !phone || !purchasedAlbumTitle) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const client = await User.create({
      email,
      password: "", // Password will be set via OTP
      role: "client",
    });

    const album = await Album.findOne({
      where: { title: purchasedAlbumTitle },
    });
    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    await PurchasedItem.create({
      userId: client.id,
      productId: album.id,
      productType: 'Albums',
      paymentStatus: 'COMPLETED',
      paymentReference: 'ADMIN_GRANT'
    });
    res.status(201).json({ message: "Client added successfully" });
  } catch (error) {
    console.error("Error in addClient:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add new album
exports.addAlbum = async (req, res) => {
  const { title, description, downloadLink } = req.body;

  // Input validation
  if (!title || !description || !downloadLink) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const [album, created] = await Album.upsert({
      title,
      description,
      downloadLink,
    });

    if (created) {
      res.status(201).json({ message: "Album added successfully" });
    } else {
      res.status(200).json({ message: "Album updated successfully" });
    }
  } catch (error) {
    console.error("Error in addAlbum:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create a new album
exports.createAlbum = async (req, res) => {
  try {
    const album = await Album.create(req.body);
    res.status(201).json(album);
  } catch (error) {
    console.error("Error creating album:", error);
    res.status(500).json({ message: "Failed to create album", error });
  }
};

// Update an existing album
exports.updateAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Album.update(req.body, { where: { id } });
    if (updated) {
      const updatedAlbum = await Album.findByPk(id);
      res.status(200).json(updatedAlbum);
    } else {
      res.status(404).json({ message: "Album not found" });
    }
  } catch (error) {
    console.error("Error updating album:", error);
    res.status(500).json({ message: "Failed to update album", error });
  }
};

// Delete an album
exports.deleteAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Album.destroy({ where: { id } });
    if (deleted) {
      res.status(200).json({ message: "Album deleted successfully" });
    } else {
      res.status(404).json({ message: "Album not found" });
    }
  } catch (error) {
    console.error("Error deleting album:", error);
    res.status(500).json({ message: "Failed to delete album", error });
  }
};

// --- NEW UNIFIED PRODUCT CRUD WITH B2 UPLOADS ---

// Get all products (paginated or combined) for Admin Dashboard
exports.getAllProducts = async (req, res) => {
  try {
    const albums = await Album.findAll({ include: [Category] });
    const videos = await Video.findAll({ include: [Category] });
    const books = await Book.findAll({ include: [Category] });
    const stories = await AfricanStory.findAll({ include: [Category] });

    res.status(200).json({ albums, videos, books, stories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching products", error });
  }
};

// Create Product with Upload
exports.createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      categoryId,
      songs, video, audio, coloringPics, coloredPics, ugx, usd, status, youtubeUrl
    } = req.body;
    const files = req.files; // Expected to come from multer fields

    if (!categoryId) {
      return res.status(400).json({ message: "Category ID is required" });
    }

    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const Model = getModelByCategoryType(category.type?.toUpperCase() || "");
    if (!Model) {
      return res.status(400).json({ message: "Invalid category type for product creation" });
    }

    let thumbnailUrl = null;
    let fileUrls = {};

    // Handle Image/Thumbnail
    if (files?.thumbnail?.[0]) {
      thumbnailUrl = await uploadToB2(
        files.thumbnail[0].buffer,
        files.thumbnail[0].originalname,
        "thumbnails"
      );
    }

    // Handle other specific files depending on type
    if (files?.mainFile?.[0]) {
      const fileUrl = await uploadToB2(
        files.mainFile[0].buffer,
        files.mainFile[0].originalname,
        category.type?.toLowerCase().replace(" ", "_") || "products"
      );

      // Assign to the correct field based on model
      if (Model === Video) {
        fileUrls.videoUrl = fileUrl;
      } else if (Model === Book) {
        fileUrls.pdfUrl = fileUrl; // assuming book has pdfUrl
      } else if (Model === AfricanStory) {
        // Story could have storyBookUrl, coloringBookUrl, etc. We'll map mainFile to storyBookUrl for simplicity if needed,
        // or support multiple specific fields in multer (e.g. req.files.storyBookUrl)
        fileUrls.storyBookUrl = fileUrl;
      }
    }

    // Extra fields for AfricanStory if provided
    if (files?.videoFile?.[0] && Model === AfricanStory) {
      fileUrls.videoUrl = await uploadToB2(
        files.videoFile[0].buffer,
        files.videoFile[0].originalname,
        "story_videos"
      );
    }
    if (files?.coloringBookFile?.[0] && Model === AfricanStory) {
      fileUrls.coloringBookUrl = await uploadToB2(
        files.coloringBookFile[0].buffer,
        files.coloringBookFile[0].originalname,
        "story_coloring_books"
      );
    }
    if (files?.flashcardsFile?.[0] && Model === AfricanStory) {
      fileUrls.flashcardsUrl = await uploadToB2(
        files.flashcardsFile[0].buffer,
        files.flashcardsFile[0].originalname,
        "story_flashcards"
      );
    }

    // Base product data
    const productData = {
      title,
      description,
      categoryId,
      thumbnail: thumbnailUrl,
      ...fileUrls,
    };

    if (Model === Album) {
      productData.songs = songs || 0;
      productData.video = video || 0;
      productData.audio = audio || 0;
      productData.coloringPics = coloringPics || 0;
      productData.coloredPics = coloredPics || 0;
      productData.ugx = ugx || 'UGX 0';
      productData.usd = usd || 0;
      productData.status = status || 'completed';
      productData.youtubeUrl = youtubeUrl || null;
      // Provide dummy contents json
      productData.contents = { "info": "migrated from generic form" };
      productData.image = thumbnailUrl || 'placeholder.jpg'; // Required field in Album
    } else {
      productData.price = price || 0;
      if (Model === Book) {
        productData.coverImage = thumbnailUrl;
        productData.fileUrl = fileUrls.pdfUrl;
      }
      if (Model === Video) {
        productData.fileUrl = fileUrls.videoUrl;
      }
    }

    // Merge and save
    const newProduct = await Model.create(productData);

    res.status(201).json({ message: "Product created successfully", product: newProduct });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Error creating product", error });
  }
};

// Delete product based on category type
exports.deleteUnifiedProduct = async (req, res) => {
  try {
    const { id, type } = req.params;

    const Model = getModelByCategoryType(type.toUpperCase());
    if (!Model) {
      return res.status(400).json({ message: "Invalid product type" });
    }

    const deleted = await Model.destroy({ where: { id } });
    if (deleted) {
      res.status(200).json({ message: "Product deleted successfully" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Error deleting product", error });
  }
};

// Get single unified product
exports.getUnifiedProduct = async (req, res) => {
  try {
    const { id, type } = req.params;

    const Model = getModelByCategoryType(type.toUpperCase());
    if (!Model) {
      return res.status(400).json({ message: "Invalid product type" });
    }

    const product = await Model.findByPk(id, { include: [Category] });
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Error fetching product", error });
  }
};

// Update unified product
exports.updateUnifiedProduct = async (req, res) => {
  try {
    const { id, type } = req.params;
    const {
      title,
      description,
      price,
      categoryId,
      songs, video, audio, coloringPics, coloredPics, ugx, usd, status, youtubeUrl
    } = req.body;
    const files = req.files; // Expected to come from multer fields

    const Model = getModelByCategoryType(type.toUpperCase());
    if (!Model) {
      return res.status(400).json({ message: "Invalid product type" });
    }

    const product = await Model.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const category = await Category.findByPk(categoryId || product.categoryId);

    let fileUrls = {};
    let thumbnailUrl = product.thumbnail;

    // Handle Image/Thumbnail update
    if (files?.thumbnail?.[0]) {
      thumbnailUrl = await uploadToB2(
        files.thumbnail[0].buffer,
        files.thumbnail[0].originalname,
        "thumbnails"
      );
    }

    // Handle other specific files depending on type
    if (files?.mainFile?.[0]) {
      const fileUrl = await uploadToB2(
        files.mainFile[0].buffer,
        files.mainFile[0].originalname,
        category.type?.toLowerCase().replace(" ", "_") || "products"
      );

      if (Model === Video) fileUrls.videoUrl = fileUrl;
      else if (Model === Book) fileUrls.pdfUrl = fileUrl;
      else if (Model === AfricanStory) fileUrls.storyBookUrl = fileUrl;
    }

    if (files?.videoFile?.[0] && Model === AfricanStory) {
      fileUrls.videoUrl = await uploadToB2(
        files.videoFile[0].buffer, files.videoFile[0].originalname, "story_videos"
      );
    }
    if (files?.coloringBookFile?.[0] && Model === AfricanStory) {
      fileUrls.coloringBookUrl = await uploadToB2(
        files.coloringBookFile[0].buffer, files.coloringBookFile[0].originalname, "story_coloring_books"
      );
    }
    if (files?.flashcardsFile?.[0] && Model === AfricanStory) {
      fileUrls.flashcardsUrl = await uploadToB2(
        files.flashcardsFile[0].buffer, files.flashcardsFile[0].originalname, "story_flashcards"
      );
    }

    // Base product data update
    const updateData = {
      title: title || product.title,
      description: description || product.description,
      categoryId: categoryId || product.categoryId,
      thumbnail: thumbnailUrl,
      ...fileUrls,
    };

    if (Model === Album) {
      updateData.songs = songs !== undefined ? songs : product.songs;
      updateData.video = video !== undefined ? video : product.video;
      updateData.audio = audio !== undefined ? audio : product.audio;
      updateData.coloringPics = coloringPics !== undefined ? coloringPics : product.coloringPics;
      updateData.coloredPics = coloredPics !== undefined ? coloredPics : product.coloredPics;
      updateData.ugx = ugx !== undefined ? ugx : product.ugx;
      updateData.usd = usd !== undefined ? usd : product.usd;
      updateData.status = status !== undefined ? status : product.status;
      updateData.youtubeUrl = youtubeUrl !== undefined ? youtubeUrl : product.youtubeUrl;
      if (thumbnailUrl) updateData.image = thumbnailUrl;
    } else {
      updateData.price = price !== undefined ? price : product.price;
      if (Model === Book && thumbnailUrl) updateData.coverImage = thumbnailUrl;
      if (Model === Book && fileUrls.pdfUrl) updateData.fileUrl = fileUrls.pdfUrl;
      if (Model === Video && fileUrls.videoUrl) updateData.fileUrl = fileUrls.videoUrl;
    }

    await Model.update(updateData, { where: { id } });
    const updatedProduct = await Model.findByPk(id);

    res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Error updating product", error });
  }
};

// --- DYNAMIC CATEGORY CREATION MODULE ---

// Request an OTP sent to admin email
exports.requestCategoryOtp = async (req, res) => {
  try {
    const adminEmail = process.env.ADMIN_ACCOUNT || "grealmkids@gmail.com";
    await generateAndSendOtp(adminEmail);
    res.status(200).json({ message: `Security OTP sent to ${adminEmail}` });
  } catch (error) {
    console.error("Failed to send OTP", error);
    res.status(500).json({ message: "Failed to send OTP security email.", error: error.message });
  }
};

// Map string datatype name (from frontend) to standard Sequelize literal Data Types
const getSequelizeType = (typeString) => {
  switch (typeString.toUpperCase()) {
    case 'STRING': return DataTypes.STRING;
    case 'TEXT': return DataTypes.TEXT;
    case 'INTEGER': return DataTypes.INTEGER;
    case 'DECIMAL': return DataTypes.DECIMAL;
    case 'BOOLEAN': return DataTypes.BOOLEAN;
    case 'DATE': return DataTypes.DATE;
    default: return DataTypes.STRING;
  }
};

// Verify OTP and generate exactly the requested MySQL DB Table layout dynamically
exports.createDynamicCategory = async (req, res) => {
  try {
    const { otp, name, type, icon, displayOrder, customColumns } = req.body;

    // 1. Validate OTP
    const adminEmail = process.env.ADMIN_ACCOUNT || "grealmkids@gmail.com";
    const isValid = validateOtp(adminEmail, otp);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid or expired OTP." });
    }

    // 2. Build Schema for the new table
    const safeTableName = type.toLowerCase().replace(/[^a-z0-9_]/g, '_');

    // Base Ecommerce Fields Required by the Frontend
    const dynamicSchema = {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      price: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      thumbnail: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      }
    };

    // Inject Custom Columns mapped to Sequelize primitives
    if (customColumns && Array.isArray(customColumns)) {
      customColumns.forEach(col => {
        // Sanitize column names so we don't allow SQL injection identifiers
        const safeColName = col.columnName.trim().replace(/[^a-zA-Z0-9_]/g, '_');
        if (safeColName && !dynamicSchema[safeColName]) {
          dynamicSchema[safeColName] = {
            type: getSequelizeType(col.dataType),
            allowNull: true,
          };
        }
      });
    }

    // 3. Command Sequelize to physically generate the new Table using the schema object
    await sequelize.getQueryInterface().createTable(safeTableName, dynamicSchema);

    // 4. Register the new Category into the UI Database Registry
    const newCategory = await Category.create({
      name,
      type: type.toUpperCase(),
      icon: icon || 'fa-box',
      displayOrder: displayOrder || 99
    });

    res.status(201).json({
      message: "Category and dynamic table created successfully!",
      category: newCategory
    });

  } catch (error) {
    console.error("Dynamic Table build error", error);
    res.status(500).json({ message: "Failed to construct dynamic table", error: error.message });
  }
};
