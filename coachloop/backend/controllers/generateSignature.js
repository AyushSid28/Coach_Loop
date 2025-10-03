//Testing ke  liye isse razorpay ka signature generate kar raha hu

const crypto = require("crypto");


const webhookSecret = "MySecret123";  


const requestBody = JSON.stringify({
  event: "subscription.activated",
  payload: {
    subscription: {
      entity: {
        id: "sub_ABC123"
      }
    }
  }
});

// Generate HMAC SHA256 Signature
const generatedSignature = crypto
  .createHmac("sha256", webhookSecret)
  .update(requestBody)
  .digest("hex");

console.log("🔹 Generated Test Signature:", generatedSignature);
