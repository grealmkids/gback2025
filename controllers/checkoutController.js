const { Transaction, Cart, CartItem, BillingAddress, User, PurchasedItem } = require("../models");
const PesapalService = require("../utils/pesapal");

exports.initiateCheckout = async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ message: "userId is required to checkout" });
    }

    try {
        // 1. Get Cart & Items
        const cart = await Cart.findOne({
            where: { userId },
            include: [CartItem]
        });

        if (!cart || !cart.CartItems || cart.CartItems.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        // 2. Fetch currency from request (default to UGX)
        const targetCurrency = req.body.currency === 'USD' ? 'USD' : 'UGX';

        // 3. Calculate Total dynamically based on currency
        let amount = 0;
        for (const item of cart.CartItems) {
            if (targetCurrency === 'USD') {
                // Fetch product to see if it has explicit USD price
                let product;
                try {
                    const { Album, Video, Book, AfricanStory } = require("../models");
                    if (item.productType === "Albums" || item.productType === "COLLECTION") product = await Album.findByPk(item.productId);
                    else if (item.productType === "AfricanStories" || item.productType === "STORY") product = await AfricanStory.findByPk(item.productId);
                    else if (item.productType === "VIDEO" || item.productType === "VIDEO MP4") product = await Video.findByPk(item.productId);
                    else if (item.productType === "PDF" || item.productType === "BOOK") product = await Book.findByPk(item.productId);
                    else product = await Album.findByPk(item.productId);
                } catch (e) { }

                if (product && product.usd !== undefined && product.usd !== null && parseFloat(product.usd) > 0) {
                    amount += (parseFloat(product.usd) * item.quantity);
                } else {
                    // Fallback exchange rate 1 USD = 3700 UGX
                    amount += ((parseFloat(item.price) / 3700) * item.quantity);
                }
            } else {
                // UGX base
                amount += (parseFloat(item.price) * item.quantity);
            }
        }

        if (amount <= 0) {
            return res.status(400).json({ message: "Cart total must be greater than zero to checkout via Pesapal" });
        }

        // 4. Get Billing Address (Important for Pesapal)
        let billingAddress = await BillingAddress.findOne({ where: { userId } });
        let user = await User.findByPk(userId);

        if (!billingAddress) {
            // Mock one temporarily just to ensure the flow doesn't crash on Pesapal requirements if they skipped billing
            billingAddress = {
                email_address: user ? user.email : "user@grealm.org",
                phone_number: user ? user.phone : "0700000000",
                first_name: user ? user.firstname : "Grealm",
                last_name: user ? user.lastname : "User",
            }
        }

        // Save a snapshot of items
        const itemsSnapshot = cart.CartItems.map(item => ({
            productId: item.productId,
            productType: item.productType,
            title: item.title,
            price: item.price,
            quantity: item.quantity
        }));

        // Generate Custom Reference
        const merchantReference = `GREALM-${Date.now()}-${userId}-${Math.floor(Math.random() * 1000)}`;

        const clientName = `${billingAddress.first_name || 'User'} ${billingAddress.last_name || ''}`.trim();
        const itemTitles = itemsSnapshot.map(item => item.title).join(', ');

        // 5. Submit to Pesapal
        const orderData = {
            id: merchantReference,
            school_id: 1, // Optional: if using generic payload from bigezolite
            currency: targetCurrency,
            amount: amount,
            description: `Grealm Studio_${clientName}_${itemTitles}`,
            billing_address: billingAddress,
        };

        const pesapalRes = await PesapalService.submitOrder(orderData);

        if (!pesapalRes || !pesapalRes.redirect_url) {
            throw new Error("Failed to get redirect URL from Pesapal");
        }

        // 5. Save Pending Transaction
        await Transaction.create({
            userId,
            merchantReference,
            orderTrackingId: pesapalRes.order_tracking_id,
            amount,
            status: "PENDING",
            itemsSnapshot: itemsSnapshot
        });

        // Redirect URL is sent back to the frontend to redirect the user
        res.status(200).json({ redirectUrl: pesapalRes.redirect_url });
    } catch (error) {
        console.error("Checkout initiation error:", error);
        res.status(500).json({ message: "Failed to initiate checkout", error: error.message });
    }
};

exports.verifyPaymentStatus = async (req, res) => {
    const { OrderTrackingId, OrderMerchantReference } = req.query;

    if (!OrderTrackingId) {
        return res.status(400).json({ message: "OrderTrackingId is required" });
    }

    try {
        // Query Pesapal for status
        const statusRes = await PesapalService.getTransactionStatus(OrderTrackingId);

        // Example Statuses: FAILED, COMPLETED, INVALID, PENDING
        // Documentation: status_code 1 = COMPLETED, 0 = INVALID, 2 = FAILED, 3 = REVERSED
        let statusCode = 'FAILED';

        if (statusRes.status_code === 1 || statusRes.statusCode === 1) {
            statusCode = "COMPLETED";
        } else if (statusRes.status_code === 0 && (statusRes.error?.message === 'Pending Payment' || statusRes.payment_status_description === 'INVALID')) {
            // "INVALID" with "Pending Payment" means the user hasn't completed the flow yet in Sandbox.
            statusCode = 'PENDING';
        } else if (String(statusRes.payment_status_description).toUpperCase() === 'COMPLETED') {
            statusCode = 'COMPLETED';
        } else if (String(statusRes.payment_status_description).toUpperCase() === 'PENDING') {
            statusCode = 'PENDING';
        }

        // Find the transaction
        const transaction = await Transaction.findOne({ where: { orderTrackingId: OrderTrackingId } });

        if (transaction) {
            // Save status
            transaction.status = statusCode;
            await transaction.save();

            // If completed, clear the cart and theoretically give access to the purchased items
            if (transaction.status === "COMPLETED") {
                const cart = await Cart.findOne({ where: { userId: transaction.userId } });
                if (cart) {
                    await CartItem.destroy({ where: { cartId: cart.id } });
                }

                // Grant access to purchased items by inserting into PurchasedItem table
                if (transaction.itemsSnapshot && Array.isArray(transaction.itemsSnapshot)) {
                    for (const item of transaction.itemsSnapshot) {
                        try {
                            await PurchasedItem.create({
                                userId: transaction.userId,
                                productId: item.productId,
                                productType: item.productType || 'Albums', // Default gracefully
                                paymentStatus: 'COMPLETED',
                                paymentReference: transaction.orderTrackingId
                            });
                        } catch (insertError) {
                            console.error("[PurchasedItem Insert Error]", insertError);
                        }
                    }
                }
            }

            return res.status(200).json({
                status: transaction.status,
                message: `Payment ${transaction.status}`
            });
        } else {
            return res.status(404).json({ message: "Transaction not found in our records." });
        }

    } catch (error) {
        console.error("Verification error:", error);
        res.status(500).json({ message: "Failed to verify transaction.", error: error.message });
    }
};
