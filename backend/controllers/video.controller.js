import { asyncHandler } from "../utils/asyncHandler.js";
import { supabase } from "../db/supabaseDB.js";
import { extractAudioFile } from "./extract-audio.logic.js";
import { transcriptAudio } from "./audio-transcription.logic.js";
import { textSplitter } from "./text-chunking.logic.js";
import { convertToVectorEmbeddings } from "./convert-to-vector-embeddings.logic.js";

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
      videoId: data._id
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
   const videoPath = `../uploads/inputs/uploaded_file-${videoId}`
   const audioPath = `../uploads/outputs/uploaded_file-${videoId}`

   try{
      await extractAudioFile(videoPath,audioPath)
   }
   catch(error){
      return res.status(500).json({
         success: false,
         message: `Internal server error: ${error}`
      })
   }

   
   try{
     const transcription = await transcriptAudio(audioPath); //Convert audio file to text

     const chunkedText = await textSplitter(transcription); //Chunk the text

     chunkedText.map((text)=>{
      const embedding = await convertToVectorEmbeddings(text); 

      const {data,error} = await supabase.from('Documents')
      .insert({
         body: text,
         embedding: embedding,
         video: videoId
      })
      .select()
      .single()

     })
   }
   catch(error){
       return res.status(500).json({
         success: false,
         message: `Internal server error: ${error}`
       })
   }
   
   res.status(200).json({
      success: true,
      message: 'Successfully processed the video and stored its vector embeddings'
   })
})

