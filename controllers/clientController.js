const { ClientAlbum, Album } = require("../models");

// View purchased albums
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
          attributes: ["title", "downloadLink"],
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
