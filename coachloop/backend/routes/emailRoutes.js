const express = require("express");
const { sendEmail, sendPostSessionEmail } = require("../controllers/emailController");

const router = express.Router();

// General email sending route
router.post("/send", sendEmail);

// Post-session summary email route
router.post("/send-summary", sendPostSessionEmail);


module.exports = router;
