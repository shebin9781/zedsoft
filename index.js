require("dotenv").config();
const express = require("express")
const app = express()
const cors = require("cors")
require('./DB/db')

const PORT = 5000

const session =require('express-session')
const passport = require('passport')
const OAuth2Strategy = require('passport-google-oauth2').Strategy
const userdb  = require('./model/userSchema')


const clientid = "79465333799-c3lpn7spb32640qci52mn63b9rhsprmi.apps.googleusercontent.com"
const clientsecret ="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"


app.use(cors({
    origin:"http://localhost:5173/",
    methods:"GET,POST,PUT,DELETE",
    credentials:true
}))
app.use(express.json())

app.use(session({
    secret:" SECRET KEY",
    resave:false,
    saveUninitialized:true
}))
app.use(passport.initialize())
app.use(passport.session())

passport.use(
    new OAuth2Strategy({
        clientID:clientid,
        clientSecret:clientsecret,
        callbackURL:"/auth/google/callback",
        scope:["profile","email"]
    },
    async(accestoken,refreshtoken,profile,done)=>{
        console.log('profile',profile);
        
        try{
            let user = await userdb.findOne({googleId:profile.id})
            if(!user){
                user = new userdb({
                    googleId:profile.id,
                    displayName:profile.displayName,
                    email:profile.emails[0].value,
                    image:profile.photos[0].value
                });

                await user.save();
            }

            return done(null,user)
        } catch (error) {
            return done(error,null)
        }
    }
    )
)

passport.serializeUser((user,done)=>{
    done(null,user);
})

passport.deserializeUser((user,done)=>{
    done(null,user);
});

passport.serializeUser((user,done)=>{
    done(null,user)
})
passport.deserializeUser((user,done)=>{
    done(null,user)
})

app.get("/auth/google",passport.authenticate("google",{scope:["profile","email"]}));

app.get("/auth/google/callback",passport.authenticate("google",{
    successRedirect:"http://localhost:5173/home",
    failureRedirect:"http://localhost:5173/login"
}))

app.get("/login/sucess",async(req,res)=>{

    if(req.user){
        res.status(200).json({message:"user Login",user:req.user})
    }else{
        res.status(400).json({message:"Not Authorized"})
    }
})


app.listen(PORT,()=>{
    console.log(`server runing at port no${PORT}`);
    
})