const nodemailer = require("nodemailer");

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "grealmanimations@gmail.com",
        pass: "lfrq ahjm hcxb aemp", // App password
      },
    });
  }

  async sendEmail(to, subject, text) {
    try {
      const mailOptions = {
        from: "grealmanimations@gmail.com",
        to,
        subject,
        text,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log("Email sent: ", info.response);
      return info;
    } catch (error) {
      console.error("Error sending email: ", error);
      throw error;
    }
  }

  async sendHTMLEmail(to, subject, htmlContent) {
    try {
      const mailOptions = {
        from: "grealmanimations@gmail.com",
        to,
        subject,
        html: htmlContent,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log("HTML Email sent: ", info.response);
      return info;
    } catch (error) {
      console.error("Error sending HTML email: ", error);
      throw error;
    }
  }
}

module.exports = new EmailService();
