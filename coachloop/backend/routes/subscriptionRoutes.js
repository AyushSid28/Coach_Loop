const express=require('express');
const router=express.Router();
const {createSubscription,cancelSubscription}=require('../controllers/subscriptionController')
router.post('/create',createSubscription);
router.post('/cancel',cancelSubscription);

module.exports=router;