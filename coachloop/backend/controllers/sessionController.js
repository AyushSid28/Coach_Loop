const Session = require('../models/sessionModel');
const Payment = require('../models/paymentModel');
const moment = require('moment-timezone');
const { getDurationFromAmount } = require('../utils/paymentUtils');  

// Save a chat message
const saveMessage = async (req, res) => {
    try {
        const { sessionId, sender, text } = req.body;
        if (!sessionId) {
            return res.status(400).json({ message: "Session ID is required" });
        }

        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({ success: false, message: "Session Not Found!" });
        }

        session.messages.push({ sender, text });
        await session.save();

        res.status(200).json({ message: "Message Saved Successfully!" });
    } catch (error) {
        console.error("Error Saving the message", error);
        res.status(500).json({ message: "Error Saving message", error: error.message });
    }
};

// Retrieve messages for a session
const getSessionMessage = async (req, res) => {
    try {
        const { sessionId } = req.params; 

        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: "Session Not Found!" });
        }
        const messagesWithIST=session.messages.map(msg=>({
            sender:msg.sender,
            text:msg.text,
            timestamp:moment(msg.timestamp).tz("Asia/kolkata").format("YYYY-MM-DD HH:mm:ss"),
            _id:msg._id
        }));

        res.status(200).json({ messages: messagesWithIST });
    } catch (error) {
        console.error("Error fetching Messages:", error);
        res.status(500).json({ message: "Failed to retrieve messages.", error: error.message });
    }
};

// Book a session with payment integration
const bookSession = async (req, res) => {
    const { userName, email, phoneNumber, agentType, paymentId } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required to book a session." });
    }

    if (!paymentId) {
        return res.status(400).json({ message: "Payment ID is required to book a session." });
    }

    try {
        // Find the payment record
        const payment = await Payment.findOne({ razorpay_order_id: paymentId, status: 'success' });
        
        if (!payment) {
            return res.status(400).json({ message: "Valid payment not found. Please complete payment first." });
        }

        // Check if payment is already used for a session
        const existingSession = await Session.findOne({ paymentId: paymentId });
        if (existingSession) {
            return res.status(400).json({ message: "Payment already used for another session." });
        }

        const currentTime = moment().tz("Asia/Kolkata");
        const sessionEndTime = moment(currentTime).add(payment.duration, 'minutes');

        const newSession = new Session({
            userName,
            email,
            phoneNumber,
            agentType,
            sessionDate: currentTime.format('YYYY-MM-DD HH:mm:ss'),
            paymentId: paymentId,
            duration: payment.duration,
            amount: payment.amount,
            sessionStartTime: currentTime.toDate(),
            sessionEndTime: sessionEndTime.toDate(),
            isActive: true,
            paymentStatus: 'completed'
        });

        await newSession.save();

        // Update payment with session ID
        payment.sessionId = newSession._id.toString();
        await payment.save();

        res.status(201).json({
            message: "Session booked successfully!",
            sessionDetails: {
                sessionId: newSession._id,
                userName: newSession.userName,
                email: newSession.email,
                agentType: newSession.agentType,
                sessionDate: newSession.sessionDate,
                duration: newSession.duration,
                amount: newSession.amount,
                sessionEndTime: sessionEndTime.format('YYYY-MM-DD HH:mm:ss')
            }
        });

    } catch (error) {
        console.error('Error booking session:', error);
        res.status(500).json({ message: 'Failed to book session', error: error.message });
    }
};

// Validate active session with payment-based timing
const validateSession = async (req, res) => {
    const { sessionId } = req.body;

    if (!sessionId) {
        return res.status(400).json({ message: "Session ID is required" });
    }

    try {
        const session = await Session.findById(sessionId);

        if (!session) {
            return res.status(404).json({
                message: "Session not found. Please book a new session."
            });
        }

        // Check if payment is completed
        if (session.paymentStatus !== 'completed') {
            return res.status(403).json({
                message: "Payment not completed. Please complete payment to access the session."
            });
        }

        const currentTime = moment().tz("Asia/Kolkata");
        const sessionEndTime = moment(session.sessionEndTime);

        // Check if session has expired
        if (currentTime.isAfter(sessionEndTime)) {
            // Update session status to inactive
            session.isActive = false;
            await session.save();

            return res.status(403).json({
                message: "Session has expired. Please book a new session to continue.",
                sessionExpired: true
            });
        }

        // Calculate remaining time
        const remainingTime = sessionEndTime.diff(currentTime, 'seconds');

        res.status(200).json({
            message: "Session is active. You can now interact with your AI coach.",
            sessionDetails: {
                sessionId: session._id,
                userName: session.userName,
                agentType: session.agentType,
                sessionDate: session.sessionDate,
                duration: session.duration,
                remainingTime: remainingTime,
                sessionEndTime: sessionEndTime.format('YYYY-MM-DD HH:mm:ss')
            }
        });

    } catch (error) {
        console.error('Error validating session:', error);
        res.status(500).json({ message: 'Failed to validate session', error: error.message });
    }
};

module.exports = { bookSession, validateSession, saveMessage, getSessionMessage };
