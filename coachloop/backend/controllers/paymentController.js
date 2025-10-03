const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const Payment = require("../models/paymentModel");
const { getDurationFromAmount, isValidPaymentAmount, getPaymentOptions } = require("../utils/paymentUtils");

/**
 * @desc Create a Razorpay order and save it in MongoDB
 * @route POST /api/payment/create-order
 */
const createOrder = async (req, res) => {
    const { amount, currency, userEmail } = req.body;

    if (!amount || !currency) {
        return res.status(400).json({ success: false, message: "Amount and currency are required" });
    }

    // Validate payment amount
    if (!isValidPaymentAmount(amount)) {
        return res.status(400).json({ 
            success: false, 
            message: "Invalid payment amount. Supported amounts: ₹5, ₹10, ₹15, ₹20, ₹25, ₹30, ₹50, ₹100" 
        });
    }

    try {
        const duration = getDurationFromAmount(amount);
        
        const options = {
            amount: amount * 100, // Convert to paisa
            currency: currency || "INR",
            receipt: `receipt_${Date.now()}`,
            payment_capture: 1
        };

        console.log("📢 Sending Order Request to Razorpay:", options);

        const order = await razorpay.orders.create(options);
        console.log("✅ Order Created Successfully:", order);

        // Save the order details in MongoDB with duration
        const newPayment = new Payment({
            razorpay_order_id: order.id,
            amount: amount,
            currency: currency,
            duration: duration,
            userEmail: userEmail,
            status: "pending" // Mark as pending until verified
        });

        await newPayment.save();

        res.status(200).json({ 
            success: true, 
            message: "Order created successfully", 
            order,
            duration: duration,
            sessionTime: `${duration} minutes`
        });
    } catch (error) {
        console.error("❌ Error Creating Order:", error.response ? error.response.data : error);
        res.status(500).json({ success: false, message: "Error creating order", error: error.message });
    }
};



const verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    console.log("🛠️ Received Payment Verification Request");
    console.log("📌 Received Order ID:", razorpay_order_id);
    console.log("📌 Received Payment ID:", razorpay_payment_id);
    console.log("📌 Received Signature:", razorpay_signature);

    try {
        // 1️⃣ Find the order in the database
        const payment = await Payment.findOne({ razorpay_order_id });

        if (!payment) {
            console.error("❌ Order not found in database");
            return res.status(404).json({ success: false, message: "Order not found in database" });
        }

        // 2️⃣ Generate HMAC-SHA256 signature
        const generated_signature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET) // Ensure correct secret key
            .update(`${razorpay_order_id}|${razorpay_payment_id}`) // Concatenate order_id & payment_id
            .digest("hex"); // Convert to hex format

        console.log("🔑 Generated Signature:", generated_signature);

        // 3️⃣ Securely compare signatures
        const isValidSignature = crypto.timingSafeEqual(
            Buffer.from(generated_signature, "hex"), // Use "hex" instead of "utf-8"
            Buffer.from(razorpay_signature, "hex") // Use "hex" instead of "utf-8"
        );

        if (isValidSignature) {
            // ✅ 4️⃣ Payment is valid, update the order status in the database
            payment.razorpay_payment_id = razorpay_payment_id;
            payment.razorpay_signature = razorpay_signature;
            payment.status = "success"; // Mark payment as successful

            await payment.save();

            console.log("✅ Payment Verified Successfully!");
            return res.status(200).json({ success: true, message: "Payment Verified Successfully", payment });
        } else {
            // ❌ 5️⃣ If verification fails, mark it as failed
            console.error("❌ Payment Verification Failed! Signature mismatch.");
            payment.status = "failed";
            await payment.save();

            return res.status(400).json({ success: false, message: "Payment Verification Failed" });
        }
    } catch (error) {
        console.error("❌ Error Verifying Payment:", error);
        return res.status(500).json({ success: false, message: "Error verifying payment", error: error.message });
    }
};



/**
 * @desc Get available payment options
 * @route GET /api/payment/options
 */
const getPaymentOptionsController = async (req, res) => {
    try {
        const options = getPaymentOptions();
        
        res.status(200).json({
            success: true,
            message: "Payment options retrieved successfully",
            options: options
        });
    } catch (error) {
        console.error("❌ Error getting payment options:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error retrieving payment options", 
            error: error.message 
        });
    }
};

module.exports = { createOrder, verifyPayment, getPaymentOptionsController };
