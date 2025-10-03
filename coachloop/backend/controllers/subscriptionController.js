const Razorpay = require("razorpay");
const dotenv = require("dotenv");
const Subscription = require("../models/subscriptionModel");

dotenv.config();

console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID);
console.log("RAZORPAY_KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET);

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});


const createSubscription = async (req, res) => {
    console.log("🔍 Request Body Received:", req.body);
    const { plan_id, customer_email } = req.body;

    if (!plan_id || !customer_email) {
        return res.status(400).json({ success: false, message: "Plan ID and Customer Email are required" });
    }

    try {
        const subscription = await razorpay.subscriptions.create({
            plan_id: plan_id, // Fix: Use correct property name
            customer_notify: 1, // Notify customer via email
            total_count: 12, //  12 billing cycles (1 year)
        });

        console.log("Subscription Created:", subscription);

        const newSubscription = new Subscription({
            subscriptionId: subscription.id,
            plan_id: plan_id,
            customer_email: customer_email, // ✅ Fix: Use correct variable
            status: "active",
        });

        await newSubscription.save();

        res.status(201).json({ success: true, message: "Subscription Created Successfully!", subscription });
    } catch (error) {
        console.error("Error creating Subscription:", error);
        res.status(500).json({ success: false, message: "Failed Creating Subscription", error: error.message });
    }
};


const cancelSubscription = async (req, res) => {
    console.log(req.body);
    const { subscriptionId } = req.body;

    if (!subscriptionId) {
        return res.status(400).json({ success: false, message: "Subscription ID is required" });
    }

    try {
        await razorpay.subscriptions.cancel(subscriptionId);
        
        await Subscription.findOneAndUpdate(
            { subscriptionId },
            { status: "cancelled" }, // ✅ Fix: Use "cancelled" instead of "cancel"
            { new: true }
        );

        res.status(200).json({ success: true, message: "Subscription is Cancelled" });
    } catch (error) {
        console.error("❌ Error Cancelling Subscription:", error);
        res.status(500).json({ success: false, message: "Error Cancelling Subscription", error: error.message });
    }
};

module.exports = { createSubscription, cancelSubscription };
