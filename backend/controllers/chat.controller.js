import { supabase } from "../db/supabaseDB";
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
   
   const {data,error} = await supabase.from('Box')
   .insert({
      user: user,
      video: videoId
   })
   .select()
   .single()

   res.status(200).json({
      success: false,
      message: 'Successfully intialized a chat box and returned its Id',
      body: data.id
   })
})

export const responseMessage = asyncHandler(async(req,res)=>{
   const message = req.body.message;
   const chatId = req.params.chatId;

   //Convert the message into a vector embedding
   const queryEmbedding = convertToVectorEmbeddings(message);

   //This part is later work for claude due to changes in db structure
   /*supabase vector db qeury to find the most relevent chunks, start with const chunks*/
    
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
