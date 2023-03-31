const express = require('express')
const router = express.Router()
const User = require('../models/User')
const bcriptjs = require('bcryptjs')
const auth = require('../middleware/user_jwt')
const jwt = require('jsonwebtoken')
router.get('/', async (req,res,next)=>
{
    try{
        const user = await User.find({user: req.user})
        if(!user)
        {
            return res.status(400).json({
                success: false,
                msg:"Error! Relax..Solving the problem"
            })
        }
        res.status(200).json({
            success: true,
            count:user.length,
            contacts: user,
            msg: 'Contacts fetched'
        })

    }
    catch(error)
    {
        next(error)
    }

})

router.post('/', async(req, res, next)=>{
    try{
        const user = await User.create(
            {
                name: req.body.name,
                phone: req.body.phone,
                date: req.body.date
                
            });
        if(!user)
        {
            return res.status(400).json({
                success: false,
                msg: 'Something went wrong'
            })
        }

        return res.status(200).json({
            success: true,
            user: user,
            msg:'Contact Saved'
        })
}
catch(error)
{
    next(error)
}
})


router.get('/twilio', async(req, res, next)=>{
    try{
        const{sid, token, phone, otpStr} = req.body
        const client = require("twilio")(sid, token);
        client.messages
        .create({ body: otpStr, from: "+14345776178", to: phone })
        .then(message => console.log(message.sid));
        return res.status(200).json({
            success:true,
            msg:'OTP SENT'
        })
    }catch(error){
        return res.status(400).json({
            success: false,
            msg:'Twilio error'
        })
    }
})

router.post('/register', async(req,res,next)=>{
    const{username, email ,password} = req.body
    try{
        let user_exists = await User.findOne({number: number})
        if(user_exists)
        {
            return res.status(400).json(
                {
                    success: false,
                    msg: "User already exists"
                }
            )
        }

        let user = new User()
        user.username = username
        user.email = email

        const salt = await bcriptjs.genSalt(10)
        user.password = await bcriptjs.hash(password, salt)

        let size = 200
        user.avatar = "https://gravatar.com/avatar/?s="+size+'&d=retro'
        await user.save()

        const payload = {
            user:{
                id: user.id
            }
        }

        jwt.sign(payload, process.env.jwtUserSecret,{
            expiresIn : 360000
        },(err,token)=>{
            if(err) throw err;
            res.status(200).json({
            success: true,
            token: token
        })
     })
    }

    catch(err)
    {
        console.log(err)
    }
})

router.post('/login', async(req,res,next)=>
{
    const email = req.body.email
    const password = req.body.password

    try
    {
        let user = await User.findOne({email: email})
        if(!user)
        {
            return res.status(400).json({
                success:false,
                msg:"User not found!"
            })
        }
        const isMatch = await bcriptjs.compare(password, user.password)

        if(!isMatch)
        {
            return res.status(400).json({
                success: false,
                msg: "Invalid Credentials"
            })
        }

        const payload = {
            user:{
                id: user.id
            }
        }
        jwt.sign
        (
            payload,process.env.jwtUserSecret,
            {
                expiresIn:360000
            }, (err, token)=>{
                if(err) throw err

                res.status(200).json({
                    success: true,
                    msg: "Logged in..Happy Tasking ;)",
                    token: token,
                    user: user
                })
            }
        )
}
    catch(error)
    {
        console.log(error.message)
        res.status(500).json(
            {
                success: false,
                msg: 'Server error'
            }
        )
    }
})


module.exports = router
