import { supabase } from "../db/supabaseDB.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { convertToVectorEmbeddings } from "./convert-to-vector-embeddings.logic.js";
import { getAIResponse } from "./query.openAI.logic.js";

export const initChatBox = asyncHandler(async(req,res)=>{
   //Create a caht box to store all chat messages of the same topic/video
   const videoId = req.params.videoId;
   const user = req.user._id;

   //Check video existence and ownership
   const {data,error} = await supabase.from('Videos')
   .select('*')
   .eq('id',videoId)
   .single()
   
   if(error) {
      return res.status(500).json({
         success: false,
         message: `Internal server error: ${error}`
      })
   }
   if(!data) {
      return res.status(404).json({
         success: false,
         message: 'Video is not found'
      })
   }
   if(data.user !== user) {
      return res.status(400).json({
         success: false,
         message: 'Unauthorized access to the video'
      })
   }
   
   const {data1,error1} = await supabase.from('Box')
   .insert({
      user: user,
      video: videoId
   })
   .select()
   .single()

   res.status(200).json({
      success: true,
      message: 'Successfully intialized a chat box and returned its Id',
      body: data1.id
   })
})

export const responseMessage = asyncHandler(async(req,res)=>{
   const message = req.body.message;
   const chatId = req.params.chatId;

   //Convert the message into a vector embedding
   const queryEmbedding = await convertToVectorEmbeddings(message);
   
   const {data: box, error: boxError} = await supabase.from('Box')
   .select('Video')
   .eq('id',chatId)
   .single()
   
   if(boxError) {
      return res.status.json({
         success: false,
         message: `Internal server error ${error}`
      })
   }
   
   const {data: chunks, error} = await supabase.rpc('match_documents',{
      query_embedding: queryEmbedding,
      match_video_id: box.video,
      match_count: 5
   })
   
   if(error) {
      return res.status(500).json({
         success: false,
         message: `Internal server error ${error}`
      })
   }
   
   const context = chunks.map(c => c.body).join('\n\n');

   const response = await getAIResponse(message,context);
   
   //Store the response for later: chat history

   const {data,error} = await supabase.from('Chats')
   .insert({
      user_query: message,
      response: response,
      box: chatId
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
      message: 'Sucessfully got the response',
      body: response
   })
})
