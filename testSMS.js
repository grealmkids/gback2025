const { sendSMS } = require("./utils/smsService");

(async () => {
  const username = "alfredochola";
  const password = "JesusisLORD";
  const sender = "Egosms";
  const number = "256773913902";
  const message = "This is a test message from grealm.org backend.";

  try {
    const response = await sendSMS(username, password, sender, number, message);
    console.log("SMS sent successfully:", response);
  } catch (error) {
    console.error("Failed to send SMS:", error);
  }
})();
