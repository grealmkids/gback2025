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

    // Fetch from all dynamic categories
    const allCategories = await Category.findAll();
    const hardcodedTypes = ['COLLECTION', 'AUDIO', 'VIDEO MP4', 'VIDEO', 'PDF', 'BOOK', 'STORY', 'AFRICAN STORY'];
    const dynamicCats = allCategories.filter(c => !hardcodedTypes.includes(c.type));

    let dynamicProducts = [];
    for (const cat of dynamicCats) {
      const tableName = cat.type.toLowerCase().replace(/[^a-z0-9_]/g, '_');
      try {
        const [results] = await sequelize.query(`SELECT * FROM ${tableName}`);
        // Attach .Category mapping for the frontend list
        const rows = results.map(row => ({
          ...row,
          Category: cat
        }));
        dynamicProducts = dynamicProducts.concat(rows);
      } catch (sqle) {
        console.warn(`Table ${tableName} missing or format incorrect`, sqle.message);
      }
    }

    res.status(200).json({ albums, videos, books, stories, dynamicProducts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching products", error });
  }
};

// Create Product with Upload
exports.createProduct = async (req, res) => {
  try {
    const {
      title, description, price, categoryId,
      songs, video, audio, coloringPics, coloredPics, ugx, usd, status, youtubeUrl
    } = req.body;
    const files = req.files;

    if (!categoryId) return res.status(400).json({ message: "Category ID is required" });

    const category = await Category.findByPk(categoryId);
    if (!category) return res.status(404).json({ message: "Category not found" });

    let fileUrls = {};
    if (files) {
      for (const key of Object.keys(files)) {
        if (files[key] && files[key][0]) {
          const folder = key === 'thumbnail' ? 'thumbnails' : (category.type?.toLowerCase().replace(" ", "_") || "products");
          fileUrls[key] = await uploadToB2(files[key][0].buffer, files[key][0].originalname, folder);
        }
      }
    }

    const Model = getModelByCategoryType(category.type?.toUpperCase() || "");
    const baseData = { title, description, categoryId, thumbnail: fileUrls.thumbnail || null };

    if (!Model) {
      // DYNAMIC TABLE INSERTION
      const tableName = category.type.toLowerCase().replace(/[^a-z0-9_]/g, '_');
      const dynamicData = { ...baseData, price: price || 0, ...fileUrls };
      delete dynamicData.thumbnail; // to ensure it's not duplicated
      dynamicData.thumbnail = fileUrls.thumbnail || null;
      dynamicData.createdAt = new Date();
      dynamicData.updatedAt = new Date();

      const columns = Object.keys(dynamicData).join(', ');
      const placeholders = Object.keys(dynamicData).map(() => '?').join(', ');
      const values = Object.values(dynamicData);

      const [insertResult] = await sequelize.query(`INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`, {
        replacements: values
      });
      return res.status(201).json({ message: "Product created successfully in dynamic table", product: { id: insertResult, ...dynamicData } });
    }

    // HARDCODED MODEL INSERTION
    if (Model === Video && fileUrls.mainFile) fileUrls.videoUrl = fileUrls.mainFile;
    if (Model === Book && fileUrls.mainFile) fileUrls.pdfUrl = fileUrls.mainFile;
    if (Model === AfricanStory && fileUrls.mainFile) fileUrls.storyBookUrl = fileUrls.mainFile;

    const productData = { ...baseData, price: price || 0, ...fileUrls };

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

      let parsedContents = [];
      try {
        if (req.body.contents) {
          parsedContents = JSON.parse(req.body.contents);
        }
      } catch (e) { console.error("Could not parse contents", e); }

      productData.contents = parsedContents;
      productData.image = fileUrls.thumbnail || 'placeholder.jpg';
    } else {
      if (Model === Book) {
        productData.coverImage = fileUrls.thumbnail;
        productData.fileUrl = fileUrls.pdfUrl;
      }
      if (Model === Video) {
        productData.fileUrl = fileUrls.videoUrl;
      }
    }

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
      // Dynamic Table Deletion
      const tableName = type.toLowerCase().replace(/[^a-z0-9_]/g, '_');
      await sequelize.query(`DELETE FROM ${tableName} WHERE id = ?`, { replacements: [id] });
      return res.status(200).json({ message: "Product deleted successfully from dynamic table" });
    }

    const deleted = await Model.destroy({ where: { id } });
    if (deleted) res.status(200).json({ message: "Product deleted successfully" });
    else res.status(404).json({ message: "Product not found" });
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
      // Dynamic Table Selection
      const tableName = type.toLowerCase().replace(/[^a-z0-9_]/g, '_');
      const [results] = await sequelize.query(`SELECT * FROM ${tableName} WHERE id = ? LIMIT 1`, { replacements: [id] });
      if (results.length > 0) {
        const product = results[0];
        const category = await Category.findOne({ where: { type: type.toUpperCase() } });
        product.Category = category;
        return res.status(200).json(product);
      } else {
        return res.status(404).json({ message: "Product not found" });
      }
    }

    const product = await Model.findByPk(id, { include: [Category] });
    if (product) res.status(200).json(product);
    else res.status(404).json({ message: "Product not found" });
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
      title, description, price, categoryId,
      songs, video, audio, coloringPics, coloredPics, ugx, usd, status, youtubeUrl
    } = req.body;
    const files = req.files;

    const category = categoryId ? await Category.findByPk(categoryId) : null;
    let fileUrls = {};
    if (files) {
      for (const key of Object.keys(files)) {
        if (files[key] && files[key][0]) {
          const folder = key === 'thumbnail' ? 'thumbnails' : (category?.type?.toLowerCase().replace(" ", "_") || "products");
          fileUrls[key] = await uploadToB2(files[key][0].buffer, files[key][0].originalname, folder);
        }
      }
    }

    const Model = getModelByCategoryType(type.toUpperCase());
    if (!Model) {
      // Dynamic Table Update
      const tableName = type.toLowerCase().replace(/[^a-z0-9_]/g, '_');

      const updateData = { title, description, price: price || 0, ...fileUrls, updatedAt: new Date() };
      if (categoryId) updateData.categoryId = categoryId;
      if (fileUrls.thumbnail) updateData.thumbnail = fileUrls.thumbnail;

      // Clean undefined
      Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

      const updates = Object.keys(updateData).map(k => `${k} = ?`).join(', ');
      const values = Object.values(updateData);

      await sequelize.query(`UPDATE ${tableName} SET ${updates} WHERE id = ?`, {
        replacements: [...values, id]
      });
      return res.status(200).json({ message: "Product updated successfully in dynamic table" });
    }

    const product = await Model.findByPk(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (Model === Video && fileUrls.mainFile) fileUrls.videoUrl = fileUrls.mainFile;
    if (Model === Book && fileUrls.mainFile) fileUrls.pdfUrl = fileUrls.mainFile;
    if (Model === AfricanStory && fileUrls.mainFile) fileUrls.storyBookUrl = fileUrls.mainFile;

    const updateData = {
      title: title || product.title,
      description: description || product.description,
      categoryId: categoryId || product.categoryId,
      ...fileUrls
    };

    if (fileUrls.thumbnail) updateData.thumbnail = fileUrls.thumbnail;

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

      if (req.body.contents) {
        try {
          updateData.contents = JSON.parse(req.body.contents);
        } catch (e) { console.error("Could not parse contents on update", e); }
      }

      if (fileUrls.thumbnail) updateData.image = fileUrls.thumbnail;
    } else {
      updateData.price = price !== undefined ? price : product.price;
      if (Model === Book && fileUrls.thumbnail) updateData.coverImage = fileUrls.thumbnail;
      if (Model === Book && fileUrls.pdfUrl) updateData.fileUrl = fileUrls.pdfUrl;
      if (Model === Video && fileUrls.videoUrl) updateData.fileUrl = fileUrls.videoUrl;
    }

    await Model.update(updateData, { where: { id } });
    res.status(200).json({ message: "Product updated successfully" });
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
