//we going to create a two api one for signin and signup
const express=require('express');

const router=express.Router();
const bcrypt=require('bcrypt');
const User=require('../models/userModel');
const jwt=require('jsonwebtoken');
const {
    validateName,
    validateEmail,
    validatePassword
}=require('../utils/validators');
router.post("/signup",async(req,res)=>{
  try{
    const { name,email,password,isSeller }=req.body;
    //check for exesting user
    const existingUser=await User.findOne({where:{email}});
    if(existingUser){
        return res.status(403).json({err:"User already exists"});
    }
    if(!validateName(name)){
        return res.status(400).json({err:"Name validate failed"});
    }
    if(!validateEmail(email)){
        return res.status(400).json({err:"Email validate failed"});
    }
    if(!validatePassword(password)){
        return res.status(400).json({err:"Password validate failed"});
    }
//(saltOrRounds=10)is used to make password more secure.
    const hashedPassword=await bcrypt.hash(password,10);
    const user={
        name,
        email,
        password:hashedPassword,
        isSeller:isSeller || false,
    };
    const createdUser=await User.create(user);
    return res.status(201).json({
        message:`Welcome ${createdUser.name}`,
    })
  }
  catch(e){
    console.log('>>>',e);
    return res.status(500).send(e); 
  }
});

router.post('/signin',async(req,res)=>{
    try{
        const { email,password }=req.body;
        if(email.legth===0){
            return res.status(400).json({err:"please provide email"})
        }
        if(password.legth===0){
            return res.status(400).json({err:"please provide password"})
        };
        const existingUser=await User.findOne({where:{email}});
        if(!existingUser){
            return res.status(404).json({err:"user Not found"})
        }
        const passwordMatch=await bcrypt.compare(password,existingUser.password);
        if(!passwordMatch){
            return res.status(400).json({err:"email or password not match"})
        };
        const payload={ user:{id:existingUser.id}};
        const bearerToken=await jwt.sign(payload,"SECRET MESSAGE",{
            expiresIn:360000,
        });
        res.cookie('t',bearerToken,{expire:new Date()+9999});
        return res.status(200).json({
            bearerToken
        })
    }
    catch(e){
        return res.status(500).send(e);
    }
})
router.get('/signout',(req,res)=>{
    try{
      res.clearCookie('t');
      return res.status(200).json({message:"cookie deleted"})
    }catch(e){
        res.status(500).send(e);
    }
})


module.exports=router;