// const twilio = require('twilio');
// const dotenv = require('dotenv');
// const moment = require('moment-timezone');
// const Session = require('../models/sessionModel');

// dotenv.config();

// const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// // Function to send SMS
// const sendSMS = async (to, message) => {
//     try {
//         const response = await client.messages.create({
//             body: message,
//             from: process.env.TWILIO_PHONE_NUMBER, // ✅ FIXED
//             to: to,
//         });
//         console.log(`✅ SMS Sent to ${to}: ${response.sid}`);
//         return { success: true, sid: response.sid };
//     } catch (error) {
//         console.error("❌ Error sending SMS:", error);
//         return { success: false, error: error.message };
//     }
// };

// // Function to send automated reminders
// const sendSMSReminder = async (req, res) => {
//     try {
//         const currentTimeIST = moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");

//         // Find upcoming sessions within the next 1 hour that haven't received SMS reminders
//         const upcomingSessions = await Session.find({
//             sessionDate: {
//                 $gte: currentTimeIST,
//                 $lte: moment(currentTimeIST).add(1, 'hour').format("YYYY-MM-DD HH:mm:ss")
//             },
//             smsSent: false
//         });

//         for (let session of upcomingSessions) {
//             if (!session.phoneNumber) {
//                 console.warn(`⚠️ No phone number found for ${session.userName}`);
//                 continue;
//             }

//             const messageBody = `📢 Reminder: Your AI coaching session with ${session.agentType} is scheduled for ${session.sessionDate} (IST). Be ready!`;

//             const smsResponse = await sendSMS(session.phoneNumber, messageBody);

//             if (smsResponse.success) {
//                 session.smsSent = true;
//                 await session.save();
//                 console.log(`✅ SMS reminder sent to ${session.phoneNumber}`);
//             }
//         }

//         res.status(200).json({ success: true, message: "SMS reminders sent successfully!" });

//     } catch (error) {
//         console.error("❌ Error sending SMS reminders:", error);
//         res.status(500).json({ success: false, message: "Failed to send SMS reminders", error: error.message });
//     }
// };

// module.exports = { sendSMSReminder,sendSMS };
