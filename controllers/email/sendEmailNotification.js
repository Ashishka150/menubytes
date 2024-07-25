require("dotenv").config();
const nodemailer = require("nodemailer");

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail", // Use your email service provider
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app password
  },
});

function sendEmailNotification(
  email,
  restaurantName,
  amountSpent,
  pointsAdded,
  totalPoints,
  callback
) {
  const mailOptions = {
    from: process.env.EMAIL_USER, // Your email address
    to: email,
    subject: `${restaurantName} - Your Loyalty Points Update`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${restaurantName} - Loyalty Points Update</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background-color: #343a40;
            color: #ffffff;
            padding: 20px;
            text-align: center;
            font-size: 24px;
            font-weight: bold;
          }
          .content {
            padding: 20px;
            color: #343a40;
          }
          .content p {
            line-height: 1.6;
          }
          .footer {
            background-color: #343a40;
            color: #ffffff;
            padding: 10px;
            text-align: center;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            ${restaurantName}
          </div>
          <div class="content">
            <p>Dear Valued Customer,</p>
            <p>Thank you for dining at <strong>${restaurantName}</strong>. We hope you had a wonderful experience.</p>
            <p>Your bill amount is <strong>$${amountSpent}</strong>. We have credited <strong>${pointsAdded}</strong> loyalty points to your wallet.</p>
            <p>Your total point balance is now <strong>${totalPoints}</strong>.</p>
            <p>We appreciate your loyalty and look forward to serving you again soon.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} ${restaurantName}. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `,
  };

  transporter.sendMail(mailOptions, callback);
}


function sendRedeemNotification(
  email,
  restaurantName,
  pointsRedeemed,
  discountAmount,
  totalPoints,
  callback
) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `${restaurantName} - Your Redemption Confirmation`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${restaurantName} - Redemption Confirmation</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background-color: #343a40;
            color: #ffffff;
            padding: 20px;
            text-align: center;
            font-size: 24px;
            font-weight: bold;
          }
          .content {
            padding: 20px;
            color: #343a40;
          }
          .content p {
            line-height: 1.6;
          }
          .footer {
            background-color: #343a40;
            color: #ffffff;
            padding: 10px;
            text-align: center;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            ${restaurantName}
          </div>
          <div class="content">
            <p>Dear Valued Customer,</p>
            <p>Thank you for redeeming your points at <strong>${restaurantName}</strong>.</p>
            <p>You have redeemed <strong>${pointsRedeemed}</strong> points for a discount of <strong>$${discountAmount}</strong>.</p>
            <p>Your total point balance is now <strong>${totalPoints}</strong>.</p>
            <p>We appreciate your loyalty and look forward to serving you again soon.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} ${restaurantName}. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `,
  };

  transporter.sendMail(mailOptions, callback);
}

module.exports = {
  sendEmailNotification,
  sendRedeemNotification,
};
