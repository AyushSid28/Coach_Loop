const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
    razorpay_order_id: { type: String, required: true },
    razorpay_payment_id: { type: String },
    razorpay_signature: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: { type: String, default: "pending" }, // pending, success, failed
    duration: { type: Number }, // Session duration in minutes based on amount
    userEmail: { type: String }, // Link payment to user
    sessionId: { type: String }, // Link payment to session
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Payment", PaymentSchema);
