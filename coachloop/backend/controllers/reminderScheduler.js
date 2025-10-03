const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const moment = require('moment-timezone');
const Session = require('../models/sessionModel');
const { sendSMS } = require('./smsController'); 

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Send Email Reminder**
const sendEmailReminder = async () => {
    try {
        const currentTimeIST = moment().tz("Asia/Kolkata").toDate();

        // Find sessions happening in the next 1 hour that haven't been reminded
        const upcomingSessions = await Session.find({
            sessionDate: {
                $gte: currentTimeIST,
                $lte: moment(currentTimeIST).add(1, 'hour').toDate()
            },
            reminderSent: false
        });

        for (let session of upcomingSessions) {
            if (!session.email) {
                console.warn(`No email found for session of ${session.userName}`);
                continue;
            }

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: session.email,
                subject: "Reminder: Your AI Coaching Session is in 1 Hour",
                text: `Hello ${session.userName},\n\nYour session with ${session.agentType} is at ${moment(session.sessionDate).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")} (IST).\n\nSee you soon!\n\nBest,\nCoachLoop`
            };

            await transporter.sendMail(mailOptions);

            // ✅ Update reminder status
            session.reminderSent = true;
            await session.save();

            console.log(`Email reminder sent to ${session.email}`);
        }
    } catch (error) {
        console.error(" Error sending email reminders:", error);
    }
};

// 📲 **Send SMS Reminder**
// const sendSMSReminder = async () => {
//     try {
//         const currentTimeIST = moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");

//         // Find sessions happening in the next 1 hour that haven't received SMS
//         const upcomingSessions = await Session.find({
//             sessionDate: {
//                 $gte: currentTimeIST,
//                 $lte: moment(currentTimeIST).add(1, 'hour').format("YYYY-MM-DD HH:mm:ss")
//             },
//             smsSent: false
//         });

//         for (let session of upcomingSessions) {
//             if (!session.phoneNumber) {
//                 console.warn(`⚠️ No phone number for session of ${session.userName}`);
//                 continue;
//             }

//             const message = `📢 Reminder: Your ${session.agentType} session is scheduled for ${session.sessionDate} (IST). - CoachLoop`;

//             // ✅ Send SMS
//             const smsResponse = await sendSMS(session.phoneNumber, message);

//             if (smsResponse.success) {
//                 session.smsSent = true;
//                 await session.save();
//                 console.log(`✅ SMS reminder sent to ${session.phoneNumber}`);
//             }
//         }
//     } catch (error) {
//         console.error("❌ Error Sending SMS:", error);
//     }
// };


setInterval(sendEmailReminder, 60000);
// setInterval(sendSMSReminder, 60000);

module.exports = { sendEmailReminder};
