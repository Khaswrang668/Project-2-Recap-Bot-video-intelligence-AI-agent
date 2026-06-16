import { supabase } from "../db/supabaseDB";
import { asyncHandler } from "../utils/asyncHandler.js";
import { convertToVectorEmbeddings } from "./convert-to-vector-embeddings.logic.js";
import { getAIResponse } from "./query.openAI.logic.js";

export const responseMessage = asyncHandler(async(req,res)=>{
   const message = req.body.message;
   const videoId = req.params.videoId;

   //Convert the message into a vector embedding
   const queryEmbedding = convertToVectorEmbeddings(message);

   //Retrieve relevent results/embeddings from vector db
   const { data, error } = await supabase.rpc('match_chunks', {
   query_embedding: queryEmbedding, 
   match_threshold: 0.75,
   match_count: 5,
   filter_video_id: videoId
   });
    
   if(error) {
      return res.status(500).json({
         success: false,
         message: `Internal server error ${error}`
      })
   }
   
   const context = chunks.map(c => c.body).join('\n\n');

   const response = await getAIResponse(message,context);

   res.status(200).json({
      success: true,
      message: 'Sucessfully got the response',
      body: response
   })
})