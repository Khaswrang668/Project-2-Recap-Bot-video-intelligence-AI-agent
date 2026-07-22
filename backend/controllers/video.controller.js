import { asyncHandler } from "../utils/asyncHandler.js";
import { supabase } from "../db/supabaseDB.js";
import { extractAudioFile } from "../business-logic/extract-audio.logic.js";
import { transcriptAudio } from "../business-logic/audio-transcription.logic.js";
import { textSplitter } from "../business-logic/text-chunking.logic.js";
import { convertToVectorEmbeddings } from "../business-logic/convert-to-vector-embeddings.logic.js";
import fs from 'fs';

export const generateAndSendID = asyncHandler(async(req,res)=>{
   const userID = req.user.id;
   console.log(`User: ${userID}`)

   const {data,error} = await supabase.from('Videos')
   .insert({
      user: userID
   })
   .select()
   .single()
   
   console.log(data);

   if(error) {
     return res.status(500).json({
        success: false,
        message: `Internal server error ${error}`
     })
   }
   
   res.status(200).json({
      success: true,
      message: 'VideoID generated successfully',
      videoId: data.id
   })
})

export const processVideo = asyncHandler(async(req,res)=>{
   const videoId = req.params.videoId;
   const userId = req.user.id;
   
   //Check if the video actually belongs to the user
   const {data,error} = await supabase.from('Videos')
   .select('*')
   .eq('id',videoId)
   .single()

   if(error) {
     return res.status(500).json({
        success: false,
        message: `Internal server error ${error}`
     })
   }
   console.log(`${data.user}  ${userId}`);

   if(data.user !== userId) {
     return res.status(404).json({
        success: false,
        message: `Unauthorized access to the video`
     })
   }

   //Fetch the video and start processing it
   const videoPath = req.file.path;
   const audioPath = `uploads/outputs/uploaded_file-${videoId}.mp3`
   
   try{
     await extractAudioFile(videoPath,audioPath)
     const transcription = await transcriptAudio(audioPath); //Convert audio file to text
     const chunkedText = await textSplitter(transcription); //Chunk the text
     const embedding = await convertToVectorEmbeddings(chunkedText);

     const rows = chunkedText.map((chunk, i) => ({
     body: chunk,
     embedding: embeddingResults[i].embedding,
     video: videoId
    }));

    const { error } = await supabase.from('Documents').insert(rows);
   }
   catch(error){
       return res.status(500).json({
         success: false,
         message: `Internal server error: ${error}`
       })
   }
   finally {
     if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
     if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
   }
   
   res.status(200).json({
      success: true,
      message: 'Successfully processed the video and stored its vector embeddings'
   })
})

