const express=require('express');
const router=express.Router();
const {createOrder,verifyPayment, getPaymentOptionsController}=require('../controllers/paymentController');

router.get('/options', getPaymentOptionsController);
router.post('/create-payment',createOrder);
router.post('/verify-payment',verifyPayment);

module.exports=router;
