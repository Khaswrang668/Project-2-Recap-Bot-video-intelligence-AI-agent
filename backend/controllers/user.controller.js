import { asyncHandler } from "../utils/asyncHandler.js";
import { supabase } from "../db/supabaseDB.js"; //import createClient obj as supabase func 
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async(userId,username,email)=>{
    const accessToken = jwt.sign(
      {
        _id: userId,
        username: username,
        email: email
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
      }
    )

    const refreshToken = jwt.sign(
      {
        _id: userId,
        username: username,
        email: email
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
      }
    )

    return {accessToken,refreshToken};
}

export const userLogin = asyncHandler(async(req,res)=>{
    const {identifier,password} = req.body;

    if(!identifier) {
        return res.status(400).json({
            success: false,
            message: 'Please enter username or email'
        })
    }
    
    if(!password) {
        return res.status(400).json({
            success: false,
            message: 'Please enter password'
        })
    }

    const {data,error} = await supabase.from('Users')
    .select('*')
    .or(`username.eq.${identifier},email.eq.${identifier}`)
    .single()
    
    if(error) {
        return res.status(500).json({
            success: false,
            message: `Internal server error: ${error}`
        })
    }

    const verified = await bcrypt.compare(password,data.password);

    if(!verified){
        return res.status(401).json({
            success: false,
            message: 'Entered wrong password '
        })
    }

    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(data.id,username,email);

    const options = {
        httpOnly: true,
        secure: true
    }

    res
    .status(200)
    .cookie('accessToken',accessToken,options)
    .cookie('refreshToken',refreshToken,options)
    .json({
       success: true,
       message: 'User login successfull !',
    })
})

export const registerUser = asyncHandler(async(req,res)=>{
    const {username,email,password} = req.body;

    if(!username || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Please fill in the missing fields in registration form'
        })
    }
    
    if(password.length < 10 ){
        return res.status(400).json({
            success: false,
            message: 'Password is too short'
        })
    }

    if(password.length > 100){
        return res.status(400).json({
            success: false,
            message: 'Password is too long'
        })
    }

    
    const hashedPassword = await bcrypt.hash(password,10);

    const {data, error}= await supabase.from('Users')
    .insert({
     username,
     email,
     password: hashedPassword
    })
    .select()
    .single()

    if(error) {
        return res.status(500).json({
            success: false,
            message: `Internal server error: ${error}`
        })
    }

    res.status(200).json({
        success: true,
        message: 'User registration is successfull',
        body: data
    })
}) 

export const userLogout = asyncHandler(async(req,res)=>{
    const userId = req.user._id;

    const {data,error} = await supabase.from('Users')
    .update({refreshToken: 1})
    .eq('_id',userId)
    .select()
    .single()
    
    if(error) {
        return res.status(500).json({
            success: false,
            message: `Internal server error: ${error}`
        })
    }
    
    const options = {
        httpOnly: true,
        secure: true
    }

    res.status(200)
    .clearCookie('accessToken',options)
    .clearCookie('refreshToken',options)
    .json({
        success: true,
        message: 'User successfully logged out'
    })
})