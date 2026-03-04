const { Cart, CartItem, Album, Video, Book, AfricanStory } = require("../models");

// Get a user's cart
exports.getCart = async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ message: "userId is required." });
    }

    try {
        let cart = await Cart.findOne({
            where: { userId },
            include: [CartItem],
        });

        if (!cart) {
            cart = await Cart.create({ userId });
            cart.CartItems = [];
        }

        res.status(200).json(cart);
    } catch (error) {
        console.error("Error fetching cart:", error);
        res.status(500).json({ message: "Failed to fetch cart", error });
    }
};

// Add to cart
exports.addToCart = async (req, res) => {
    const { userId, productId, productType, quantity = 1 } = req.body;

    if (!userId || !productId || !productType) {
        return res.status(400).json({ message: "userId, productId, and productType are required." });
    }

    try {
        // 1. Get Product Details for Price & Name
        let product;
        if (productType === "Albums") product = await Album.findByPk(productId);
        else if (productType === "AfricanStories") product = await AfricanStory.findByPk(productId);
        else if (productType === "VIDEO") product = await Video.findByPk(productId);
        else if (productType === "PDF") product = await Book.findByPk(productId);
        else product = await Album.findByPk(productId); // fallback

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const price = product.price || product.ugx || 0;
        const title = product.title || "Unknown Product";
        const coverImage = product.thumbnail || product.coverImage || product.image || "";

        // 2. Get or Create Cart
        let cart = await Cart.findOne({ where: { userId } });
        if (!cart) {
            cart = await Cart.create({ userId });
        }

        // 3. Check if Item Exists
        let cartItem = await CartItem.findOne({
            where: { cartId: cart.id, productId, productType }
        });

        if (cartItem) {
            // Update quantity
            cartItem.quantity += parseInt(quantity);
            await cartItem.save();
        } else {
            // Create new item
            cartItem = await CartItem.create({
                cartId: cart.id,
                productId,
                productType,
                title,
                price,
                quantity,
                coverImage
            });
        }

        res.status(200).json({ message: "Item added to cart", cartItem });
    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({ message: "Failed to add to cart", error });
    }
};

// Update item quantity
exports.updateQuantity = async (req, res) => {
    const { cartItemId } = req.params;
    const { quantity, userId } = req.body;

    if (quantity === undefined || quantity < 1) {
        return res.status(400).json({ message: "Valid quantity is required." });
    }

    try {
        const item = await CartItem.findByPk(cartItemId, {
            include: [{ model: Cart, where: { userId } }]
        });

        if (!item) {
            return res.status(404).json({ message: "Cart item not found or unauthorized" });
        }

        item.quantity = quantity;
        await item.save();

        res.status(200).json({ message: "Quantity updated", item });
    } catch (error) {
        console.error("Error updating quantity:", error);
        res.status(500).json({ message: "Failed to update quantity", error });
    }
}

// Remove item from cart
exports.removeFromCart = async (req, res) => {
    const { cartItemId } = req.params;
    const { userId } = req.query; // to secure

    try {
        const item = await CartItem.findByPk(cartItemId, {
            include: [{ model: Cart, where: { userId } }]
        });

        if (!item) {
            return res.status(404).json({ message: "Cart item not found or unauthorized" });
        }

        await item.destroy();
        res.status(200).json({ message: "Item removed from cart" });
    } catch (error) {
        console.error("Error removing from cart:", error);
        res.status(500).json({ message: "Failed to remove item", error });
    }
}
