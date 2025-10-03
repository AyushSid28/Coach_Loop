const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const moment = require('moment-timezone');
const Session = require('../models/sessionModel');

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 1️⃣ Generic Email Sending Function
const sendEmail = async (req, res) => {
    const { to, subject, text } = req.body;

    let mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        text: text
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: "Email sent successfully!" });
    } catch (error) {
        console.error("Email send error:", error);
        res.status(500).json({ success: false, message: "Failed to send email", error: error.message });
    }
};

// 2️⃣ Post-Session Summary Email Function
const sendPostSessionEmail = async (req, res) => {
    const { userName, agentType } = req.body;

    try {
        const session = await Session.findOne({ userName, agentType }).sort({ sessionDate: -1 });

        if (!session) {
            return res.status(404).json({ message: "No session found for this user." });
        }

        if (!session.email) {
            return res.status(400).json({ message: "Email not found for this session." });
        }

        console.log("📧 Sending email to:", session.email);  // ✅ Debugging line

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: session.email,  // ✅ Ensure it's not undefined
            subject: "Your AI Coaching Session Summary",
            text: `Hello ${session.userName},\n\nSummary of your session with ${session.agentType} on ${session.sessionDate}:\n\n[Summary Details Here]`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: "Post-session email sent successfully!" });

    } catch (error) {
        console.error("❌ Error sending post-session email:", error);
        res.status(500).json({ success: false, message: "Failed to send email", error: error.message });
    }
};

module.exports = { sendEmail, sendPostSessionEmail };
