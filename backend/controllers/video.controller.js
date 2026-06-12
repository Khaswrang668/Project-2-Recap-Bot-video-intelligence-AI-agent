import { asyncHandler } from "../utils/asyncHandler.js";
import { supabase } from "../db/supabaseDB.js";
import { extractAudioFile } from "./extract-audio.logic.js";

export const generateAndSendID = asyncHandler(async(req,res)=>{
   const userID = req.user._id;

   const {data,error} = await supabase.from('Videos')
   .insert({
      user: userID
   })
   .select()
   .single()

   if(error) {
     return res.status(500).json({
        success: false,
        message: `Internal server error ${error}`
     })
   }
   
   res.status(200).json({
      success: true,
      message: 'VideoID generated successfully',
      body: data._id
   })
})

export const processVideo = asyncHandler(async(req,res)=>{
   const videoId = req.params.videoId;
   const userId = req.user._id;
   
   //Check if the video actually belongs to the user
   const {data,error} = await supabase.from('Videos')
   .select('*')
   .eq('_id',videoId)
   .single()

   if(error) {
     return res.status(500).json({
        success: false,
        message: `Internal server error ${error}`
     })
   }

   if(data.user !== userId) {
     return res.status(404).json({
        success: false,
        message: `Unauthorized access to the video`
     })
   }

   //Fetch the video and start processing it
   const videoPath = `../uploads/inputs/uploaded_file${videoId}.mp4`
   const audioPath = `../uploads/outputs/uploaded_file${videoId}.mp3`

   try{
       extractAudioFile(videoPath,audioPath)
   }
   catch(error){
       throw new Error(`Audio extraction failed ${error}`)
       return res.status(500).json({
         success: false,
         message: `Internal server error: ${error}`
       })
   }

   //Transcipt audio file into text using openAI wishper
   
})

