const express=require('express');
const router=express.Router();

const {submitFeedback,getAgentFeedback}=require('../controllers/feedbackController');

router.post('/submit',submitFeedback);

router.get('/:agentType',getAgentFeedback);
module.exports=router;