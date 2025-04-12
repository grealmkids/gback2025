const axios = require("axios");

async function sendSMS(username, password, sender, number, message) {
  const url = "https://www.egosms.co/api/v1/plain/";
  const params = new URLSearchParams({
    username,
    password,
    sender,
    number,
    message,
  });

  console.log("SMS API Request URL:", `${url}?${params.toString()}`); // Log the full request URL
  console.log("SMS API Request Parameters:", params.toString()); // Log the request parameters

  try {
    const response = await axios.get(`${url}?${params.toString()}`);
    console.log("Full SMS API Response:", response.data); // Log the full response for debugging
    return response.data;
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw error;
  }
}

module.exports = { sendSMS };
