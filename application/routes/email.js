const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function sendNotificationEmail(toEmail, senderName, messageSnippet) {
  const mailOptions = {
    from: `"Gator Trade" <${process.env.MAIL_USER}>`,
    to: toEmail,
    subject: `📩 New interest in your listing from ${senderName}`,
    text: `Hi,

You have a new message on Gator Trade from ${senderName} regarding your listing:

"${messageSnippet}"

Log in to your account to view and reply to the message

Thank you, Team 08`,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = {
  transporter,
  sendNotificationEmail
};