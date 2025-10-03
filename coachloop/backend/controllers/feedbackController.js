const Feedback=require('../models/feedbackModel');

//Submitting the feedback after aq session
const submitFeedback=async(req,res) =>{
   const {userName,agentType,rating,comments}=req.body;

   try{
     const newFeedback=new Feedback({
         userName,
         agentType,
         rating,
         comments
     });
     await newFeedback.save();
     res.status(201).json({success:true,message:"Feedback is Submitted Successfully",feedback:newFeedback})
   }
   catch(error){
      console.error('Error Submitting the Feedback',error);
      res.status(500).json({success:false,message:"Server while submitting the feedback",error:error.message});
   }
};

//Fetch Feedback for an agent
const getAgentFeedback=async(req,res)=>{
   const {agentType}=req.params;

   try{
     const feedbacks=await Feedback.find({agentType});
      res.status(200).json({success:true,feedbacks});
     

   }
   catch(error){
      console.error("Error Fetching the Feedback",error);
      res.status(500).json({success:false,message:"server error while fetching feedback"})
   }
};

module.exports={submitFeedback,getAgentFeedback};