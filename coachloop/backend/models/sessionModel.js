const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
   sender: { type: String, required: true },  // ✅ Fixed typo from "senser" to "sender"
   text: { type: String, required: true },
   timestamp: { type: Date, default: Date.now }
});

const sessionSchema = new mongoose.Schema({
    userName: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String },
    agentType: { type: String, required: true },
    sessionDate: { type: String, required: true },  // Keep as String for IST handling
    messages: {  
        type: [messageSchema],  
        default: []
    },
    reminderSent: { type: Boolean, default: false },
    smsSent: { type: Boolean, default: false },
    summary: {
        text: { type: String },
        generatedAt: { type: String }     
    },
    // New fields for payment integration
    paymentId: { type: String }, // Reference to payment record
    duration: { type: Number, default: 5 }, // Session duration in minutes
    amount: { type: Number, default: 5 }, // Payment amount in rupees
    sessionStartTime: { type: Date },
    sessionEndTime: { type: Date },
    isActive: { type: Boolean, default: false },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' }
});

module.exports = mongoose.model('Session', sessionSchema);
