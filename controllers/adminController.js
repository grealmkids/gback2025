const User = require("../models/user");
const Album = require("../models/album");
const ClientAlbum = require("../models/clientAlbum");
const { body, validationResult } = require("express-validator");

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

    await ClientAlbum.create({ userId: client.id, albumId: album.id });
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
