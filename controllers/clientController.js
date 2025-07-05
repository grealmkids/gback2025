const { ClientAlbum, Album } = require("../models");
const BillingAddress = require("../models/billingAddress");
const User = require("../models/user");

// Update the attributes to include 'downloadUrl' (renamed to 'downloadLink' in the response)
exports.viewPurchasedAlbums = async (req, res) => {
  const { clientId } = req.query;

  if (!clientId) {
    return res
      .status(400)
      .json({ message: "clientId is required in the query parameters." });
  }

  try {
    const purchasedAlbums = await ClientAlbum.findAll({
      where: { userId: clientId },
      include: [
        {
          model: Album,
          attributes: ["title", ["downloadUrl", "downloadLink"]],
        },
      ],
    });

    res.json(purchasedAlbums);
  } catch (error) {
    console.error("Error in viewPurchasedAlbums:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Modify the API to exclude the `downloadUrl` field when returning all albums
exports.getAllAlbums = async (req, res) => {
  try {
    const albums = await Album.findAll({
      attributes: { exclude: ["downloadUrl"] },
    });
    res.status(200).json(albums);
  } catch (error) {
    console.error("Error fetching albums:", error);
    res.status(500).json({ message: "Failed to fetch albums", error });
  }
};

// Save or update billing address for a user
exports.saveBillingAddress = async (req, res) => {
  console.log("=== Billing Address Save Request ===");
  console.log("Request body:", JSON.stringify(req.body, null, 2));

  try {
    const {
      email,
      branch,
      email_address,
      phone_number,
      country_code,
      first_name,
      middle_name,
      last_name,
      line_1,
      line_2,
      city,
      state,
      postal_code,
      zip_code,
    } = req.body;

    // Input validation
    if (
      !email ||
      !branch ||
      !email_address ||
      !phone_number ||
      !first_name ||
      !last_name ||
      !line_1
    ) {
      return res.status(400).json({
        message:
          "Required fields: email, branch, email_address, phone_number, first_name, last_name, line_1",
      });
    }

    console.log(`Looking for user with email: ${email}`);

    // Find user by email
    let user = await User.findOne({ where: { email } });
    console.log(
      `User found:`,
      user ? `ID: ${user.id}, Email: ${user.email}` : "No user found"
    );

    if (!user) {
      console.log(`Creating new user with email: ${email}`);
      // Auto-create user if they don't exist
      user = await User.create({
        email,
        password: "", // Password will be set via OTP
        role: "client",
        phone: phone_number || null,
        firstname: first_name || null,
        lastname: last_name || null,
      });
      console.log(`User created successfully: ID ${user.id}`);
    }

    // Check if billing address already exists for this user
    const existingBillingAddress = await BillingAddress.findOne({
      where: { userId: user.id },
    });

    const billingData = {
      userId: user.id,
      branch,
      email_address,
      phone_number,
      country_code: country_code || "KE",
      first_name,
      middle_name: middle_name || null,
      last_name,
      line_1,
      line_2: line_2 || null,
      city: city || null,
      state: state || null,
      postal_code: postal_code || null,
      zip_code: zip_code || null,
    };

    let billingAddress;
    if (existingBillingAddress) {
      // Update existing billing address
      await BillingAddress.update(billingData, {
        where: { userId: user.id },
      });
      billingAddress = await BillingAddress.findOne({
        where: { userId: user.id },
      });
      res.status(200).json({
        message: "Billing address updated successfully",
        billingAddress,
      });
    } else {
      // Create new billing address
      billingAddress = await BillingAddress.create(billingData);
      res.status(201).json({
        message: "Billing address saved successfully",
        billingAddress,
      });
    }
  } catch (error) {
    console.error("=== ERROR SAVING BILLING ADDRESS ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    if (error.original) {
      console.error("Original error:", error.original);
    }
    console.error("=== END ERROR ===");

    res.status(500).json({
      message: "Failed to save billing address",
      error: error.message,
      errorType: error.name,
    });
  }
};

// Get billing address for a user
exports.getBillingAddress = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        message: "Email is required in query parameters",
      });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find billing address for the user
    const billingAddress = await BillingAddress.findOne({
      where: { userId: user.id },
      include: [
        {
          model: User,
          attributes: ["email", "role"],
        },
      ],
    });

    if (!billingAddress) {
      return res
        .status(404)
        .json({ message: "Billing address not found for this user" });
    }

    res.status(200).json(billingAddress);
  } catch (error) {
    console.error("Error fetching billing address:", error);
    res.status(500).json({
      message: "Failed to fetch billing address",
      error: error.message,
    });
  }
};

// Create user if not exists (for billing address)
exports.createUserIfNotExists = async (req, res) => {
  try {
    const { email, phone, firstName, lastName } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if user already exists
    let user = await User.findOne({ where: { email } });

    if (user) {
      return res.status(200).json({
        message: "User already exists",
        user: { id: user.id, email: user.email, role: user.role },
      });
    }

    // Create new user
    user = await User.create({
      email,
      password: "", // Password will be set via OTP
      role: "client",
      phone: phone || null,
      firstname: firstName || null,
      lastname: lastName || null,
    });

    res.status(201).json({
      message: "User created successfully",
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      message: "Failed to create user",
      error: error.message,
    });
  }
};
