import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: "info@setups.works",
    pass: "Thilak_dr1",
  },
});

const mailOptions = {
  from: "info@setups.works",
  to: ["nitheeraj1@gmail.com", "nitheeraj1@gmal.com"],
  subject: "Test Email from Terminal",
  text: "Hello! This is a test email sent directly from your terminal to verify that your Hostinger SMTP configuration is working correctly.",
};

console.log("Attempting to send email...");
transporter.sendMail(mailOptions)
  .then(info => {
    console.log('Success! Message sent: %s', info.messageId);
    process.exit(0);
  })
  .catch(err => {
    console.error('Error sending email:', err);
    process.exit(1);
  });
