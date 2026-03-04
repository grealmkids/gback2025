const axios = require("axios");

const PESAPAL_API_SANDBOX = "https://cybqa.pesapal.com/pesapalv3/api";
const PESAPAL_API_LIVE = "https://pay.pesapal.com/v3/api";

class PesapalService {
    static getApiUrl() {
        return process.env.PESAPAL_ENVIRONMENT === "production" ? PESAPAL_API_LIVE : PESAPAL_API_SANDBOX;
    }

    static async getAuthToken() {
        try {
            const apiUrl = this.getApiUrl();

            const res = await axios.post(`${apiUrl}/Auth/RequestToken`, {
                consumer_key: process.env.PESAPAL_CONSUMER_KEY,
                consumer_secret: process.env.PESAPAL_CONSUMER_SECRET,
            });
            return { token: res.data.token };
        } catch (error) {
            console.error("[Pesapal Auth] Error:", error.response ? error.response.data : error.message);
            throw new Error("Could not authenticate with Pesapal");
        }
    }

    static async submitOrder(orderData) {
        const { token } = await this.getAuthToken();
        const apiUrl = this.getApiUrl();

        // IPN ID from env
        const ipnId = process.env.PESAPAL_IPN_ID;
        const callbackUrl = process.env.PESAPAL_CALLBACK_URL;

        const payload = {
            id: orderData.id, // Our custom generated reference
            currency: "UGX",
            amount: Number(parseFloat(orderData.amount.toString()).toFixed(2)),
            description: orderData.description,
            callback_url: callbackUrl,
            notification_id: ipnId,
            billing_address: {
                email_address: orderData.billing_address.email_address || "anonymous@grealm.org",
                phone_number: orderData.billing_address.phone_number || "0000000000",
                country_code: "UG",
                first_name: orderData.billing_address.first_name || "Grealm",
                last_name: orderData.billing_address.last_name || "User",
                line_1: orderData.billing_address.line_1 || "N/A",
                city: orderData.billing_address.city || "Kampala"
            }
        };

        console.log('[PesapalService] Submitting Order Payload:', JSON.stringify(payload, null, 2));

        const response = await axios.post(
            `${apiUrl}/Transactions/SubmitOrderRequest`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        return response.data;
    }

    static async getTransactionStatus(orderTrackingId) {
        try {
            const { token } = await this.getAuthToken();
            const apiUrl = this.getApiUrl();

            console.log(`[PesapalService] Getting status for TrackingID: ${orderTrackingId}`);
            const response = await axios.get(
                `${apiUrl}/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error("[Pesapal GetStatus] Error:", error.response ? error.response.data : error.message);
            throw error;
        }
    }
}

module.exports = PesapalService;
