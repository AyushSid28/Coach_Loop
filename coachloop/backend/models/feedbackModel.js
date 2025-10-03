const mongoose=require('mongoose');
const moment=require('moment-timezone');

const feedbackSchema=new mongoose.Schema({
    userName:{type:String,required:true},
    agentType:{type:String,required:true},
    rating:{type:String,required:true,min:1,max:5},
    comments:{type:String},
    submittedAt:{type:String,
        default:()=>moment().tz("Asia/Kolkata").format("YYYY-MM-DD  HH:mm:ss")
    }
});

module.exports=mongoose.model('Feedback',feedbackSchema);