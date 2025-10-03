const crypto = require("crypto");
const dotenv = require("dotenv");

dotenv.config();

const handleWebhook = async (req, res) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const razorpaySignature = req.headers["x-razorpay-signature"];

        // 🛑 Validate if the Razorpay signature is missing
        if (!razorpaySignature) {
            console.error("❌ Razorpay Signature is missing");
            return res.status(400).json({ message: "Razorpay Signature is required" });
        }

        // ✅ Generate HMAC signature
        const generatedSignature = crypto
            .createHmac("sha256", webhookSecret)
            .update(JSON.stringify(req.body))
            .digest("hex");

        console.log("🔹 Razorpay Signature:", razorpaySignature);
        console.log("🔹 Generated Signature:", generatedSignature);

        // 🔍 Compare generated signature with the received signature
        if (generatedSignature !== razorpaySignature) {
            console.error("❌ Invalid Webhook Signature");
            return res.status(400).json({ message: "Invalid Webhook Signature" });
        }

        const event = req.body.event;
        const payload = req.body.payload;

        console.log(`📌 Razorpay Webhook Event Received: ${event}`);

        switch (event) {
            case "subscription.activated":
                console.log("✅ Subscription Activated:", payload?.subscription?.entity?.id);
                break;
            case "subscription.cancelled":
                console.log("⚠️ Subscription Cancelled:", payload?.subscription?.entity?.id);
                break;
            case "invoice.paid":
                console.log("✅ Invoice Paid:", payload?.subscription?.entity?.id);
                break;
            case "invoice.payment_failed":
                console.log("❌ Invoice Payment Failed:", payload?.subscription?.entity?.id);
                break;
            default:
                console.log("ℹ️ Other Event:", event);
                break;
        }

        res.status(200).json({ success: true, message: "Webhook processed successfully" });

    } catch (error) {
        console.error(" Error handling Webhook:", error);
        res.status(500).json({ success: false, message: "Error processing Webhook", error: error.message });
    }
};

module.exports = { handleWebhook };
