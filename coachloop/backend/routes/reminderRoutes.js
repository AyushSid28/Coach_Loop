const express = require('express');
const { sendEmailReminder } = require('../controllers/reminderScheduler');
// const { sendSMS } = require('../controllers/smsController'); // ✅ Import sendSMS function

const router = express.Router();

router.get('/send-reminders', async (req, res) => {
    try {
        await sendEmailReminder();
        res.status(200).json({ success: true, message: "Reminder emails sent successfully!" });
    } catch (error) {
        console.error("Error sending email reminders:", error);
        res.status(500).json({ success: false, message: "Failed to send reminders", error: error.message });
    }
});


// router.get('/send-sms-reminders', async (req, res) => {
//     try {
//         await sendSMSReminder();
//         res.status(200).json({ success: true, message: "SMS reminders sent successfully!" });
//     } catch (error) {
//         console.error("Error sending SMS reminders:", error);
//         res.status(500).json({ success: false, message: "Failed to send SMS reminders", error: error.message });
//     }
// });


// router.post('/send-sms', async (req, res) => {
//     const { phoneNumber, message } = req.body;

//     if (!phoneNumber || !message) {
//         return res.status(400).json({ success: false, message: "Phone number and message are required." });
//     }

//     try {
//         const response = await sendSMS(phoneNumber, message);
//         if (response.success) {
//             res.status(200).json({ success: true, message: "SMS sent successfully!", sid: response.sid });
//         } else {
//             res.status(500).json({ success: false, message: "Failed to send SMS", error: response.error });
//         }
//     } catch (error) {
//         console.error("Error sending SMS:", error);
//         res.status(500).json({ success: false, message: "Failed to send SMS", error: error.message });
//     }
// });

module.exports = router;
