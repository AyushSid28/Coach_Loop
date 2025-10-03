
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const User=require("../models/userModel");

const registerUser=async (req,res)=>{
    const {name,email,password}=req.body;

    try{
        const existingUser=await User.findOne({email});
         if(existingUser){
               return res.status(400)
         }   
        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt);

        const newUser=new User({
              name,
              email,
              password:hashedPassword,
        });

        await newUser.save();

        res.status(201).json({message:'User registration Successful'});

    }catch(error){
        console.error('Registration Error',error);
        res.status(500).json({message:'Server Error during registration'})

    }

};

const loginUser=async (req,res)=>{
    const {email,password}=req.body
    try{
        const user=await User.findOne({email});
        if(!user){
            res.status(400).json({error:'Invalid email or password'});
        }
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(400).json({message:'Invalid email or password'});
        }


  
        const token=jwt.sign({userId:user._id},process.env.JWT_SECRET,{expiresIn:'1h'});
        res.status(200).json({
            message:'Login Successfull',
            token
        })
    }catch(error){
        console.error('Error logging the user',error);
        return res.status(500).json({message:'Server error during login'});
    }
};

module.exports={registerUser,loginUser};