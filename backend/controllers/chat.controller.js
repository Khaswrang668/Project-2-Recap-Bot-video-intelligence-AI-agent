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

   const queryEmbedding = await convertToVectorEmbeddings(message);

   const {data: box, error: boxError} = await supabase.from('Box')
   .select('video')          // match actual column casing
   .eq('id',chatId)
   .single()

   if(boxError) {
      return res.status(500).json({
         success: false,
         message: `Internal server error ${boxError}`   // was `${error}` — undefined
      })
   }

   // ownership check — currently missing, anyone with a chatId can query it
   if (box.user !== req.user._id) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this chat' })
   }

   const {data: chunks, error: matchError} = await supabase.rpc('match_documents',{
      query_embedding: queryEmbedding,
      match_video_id: box.video,
      match_count: 5
   })

   if(matchError) {
      return res.status(500).json({
         success: false,
         message: `Internal server error ${matchError}`
      })
   }

   const { data: history, error: historyError } = await supabase.from('Chats')
   .select('user_query, response')
   .eq('box', chatId)
   .order('created_at', { ascending: true })
   .limit(6);

   if(historyError) {
      return res.status(500).json({
         success: false,
         message: `Internal server error ${historyError}`
      })
   }

   // --- build context ---

   const transcriptContext = chunks
      .map(chunk => chunk.body)
      .join('\n\n');

   const conversationContext = history
      .map(h => `User: ${h.user_query}\nAssistant: ${h.response}`)
      .join('\n\n');

   const context = {
      transcript: transcriptContext,
      conversation: conversationContext
   };

   const response = await getAIResponse(message, context);

   const {data: chat, error: chatError} = await supabase.from('Chats')
   .insert({
      user_query: message,
      response: response,
      box: chatId
   })
   .select()
   .single()

   if(chatError) {
      return res.status(500).json({
         success: false,
         message: `Internal server error ${chatError}`
      })
   }

   res.status(200).json({
      success: true,
      message: 'Successfully got the response',
      body: response
   })
})