const mongoose = require("mongoose");
const moment = require("moment-timezone");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    createdAt: { 
        type: String, 
        default: () => moment.tz("Asia/Kolkata").format('YYYY-MM-DD HH:mm:ss')  
    }
});

// ✅ Make sure the export is correct:
module.exports = mongoose.model('User', userSchema);
