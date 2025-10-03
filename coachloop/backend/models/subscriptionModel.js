const mongoose=require('mongoose');

const subscriptionSchema=new mongoose.Schema({
   subscriptionId:{type:String,required:true,unique:true},
   plan_id:{type:String,required:true},
   customer_email:{type:String,required:true},
   status:{type:String,default:"active"},
   createdAt:{type:Date,default:Date.now()},
});

module.exports=mongoose.model('Subscription',subscriptionSchema);

