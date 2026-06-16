import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { supabase } from "../db/supabaseDB.js";

import 'dotenv/config';

export const verifyJWT = asyncHandler(async(req, res, next) => {
    try { 
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        // console.log(token);
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized token'
            })
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const {data,error} = await supabase.from('Users').select('*').eq('id',decodedToken?._id).single();
    
        if (!data) {
            return res.status(401).json({
                success: false,
                message: "User doesn't exist-unable to verify tokens"
            })
        }
        
        if(error) {
            return res.status(500).json({
                success: false,
                message: `Internal server error ${error}`
            })
        }
        req.user = data;
        next()
    } catch (error) {
        console.log("Error in verifying the tokens",error)
        
        res.status(404).json({
            success: false,
            message: `Error in verifying the tokens,${error}`
        })
    }
    
})