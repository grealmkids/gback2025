const { Transaction, Cart, CartItem, BillingAddress, User } = require("../models");
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

        // 2. Calculate Total
        const amount = cart.CartItems.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);
        if (amount <= 0) {
            return res.status(400).json({ message: "Cart total must be greater than zero to checkout via Pesapal" });
        }

        // 3. Get Billing Address (Important for Pesapal)
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

        // 4. Submit to Pesapal
        const orderData = {
            id: merchantReference,
            school_id: 1, // Optional: if using generic payload from bigezolite
            amount: amount,
            description: "Grealm Studio Checkout",
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
                // TODO: We could insert rows into ClientAlbum here!
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
