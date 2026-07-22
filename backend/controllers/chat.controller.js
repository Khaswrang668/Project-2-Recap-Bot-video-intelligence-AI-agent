import { supabase } from "../db/supabaseDB.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { convertToVectorEmbeddings } from "../business-logic/convert-to-vector-embeddings.logic.js";
//import { getAIResponse } from "../business-logic/query-openAI.logic.js";
import { streamText, convertToModelMessages } from 'ai';
import { openai } from '@ai-sdk/openai';

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
   const userId = req.user._id;

   const queryEmbedding = await convertToVectorEmbeddings(message);

   const {data: box, error: boxError} = await supabase.from('Box')
   .select('video, user')
   .eq('id',chatId)
   .single()

   if(boxError) {
      return res.status(500).json({ success: false, message: `Internal server error ${boxError}` })
   }
   if (box.user !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this chat' })
   }

   const {data: chunks, error: matchError} = await supabase.rpc('match_documents',{
      query_embedding: queryEmbedding,
      match_video_id: box.video,
      match_count: 5
   })
   if(matchError) {
      return res.status(500).json({ success: false, message: `Internal server error ${matchError}` })
   }

   const { data: history, error: historyError } = await supabase.from('Chats')
   .select('user_query, response')
   .eq('box', chatId)
   .order('created_at', { ascending: true })
   .limit(6);
   
   if(historyError) {
      return res.status(500).json({ success: false, message: `Internal server error ${historyError}` })
   }

   const transcriptContext = chunks.length
      ? chunks.map(c => c.body).join('\n\n')
      : 'No relevant transcript sections found.';
   const conversationContext = history
      .map(h => `User: ${h.user_query}\nAssistant: ${h.response}`)
      .join('\n\n');

   // streaming headers — needed on Render to avoid buffering
   res.setHeader('Content-Type', 'text/event-stream');
   res.setHeader('Cache-Control', 'no-cache, no-transform');
   res.setHeader('Connection', 'keep-alive');
   res.setHeader('X-Accel-Buffering', 'no');

   const result = streamText({
      model: openai('gpt-4o-mini'),
      system: `You are answering questions about a video, using transcript excerpts as your source of truth.

   Transcript context:
   ${transcriptContext}

   Conversation so far:
   ${conversationContext}`,
      prompt: message,
   });

   result.pipeDataStreamToResponse(res); // sends the SSE-formatted stream

   // after the stream completes, persist the full answer
   const fullText = await result.text;
   await supabase.from('Chats').insert({
      user_query: message,
      response: fullText,
      box: chatId
   });
})

export const getChatHistory = asyncHandler(async(req,res)=>{
   const userId = req.user._id;

   const {data: chatHistory,error: chatHistoryError} = await supabase.from('Box')
   .select('*')
   .eq('user',userId)
   .order('created_at',{ascending: false})
   .limit(10)

   if(chatHistoryError) {
      return res.status(500).json({
         success: false,
         message: 'some error occured fetching the chat history data'
      })
   }

   res.status(200).json({
      success: true,
      chatHistory: chatHistory
   })
})

export const viewChat = asyncHandler(async(req,res)=>{
   const boxId = req.params.boxId;
   const userId = req.user._id;

   const { data: box, error: boxError } = await supabase.from('Box')
   .select('user')
   .eq('id', boxId)
   .single();

   if (boxError || !box) {
      return res.status(404).json({ success: false, message: 'Chat doesn\'t exist' });
   }
   if (box.user !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this chat' });
   }

   const {data: messages, error: messageError} = await supabase.from('Chats')
   .select('*')
   .eq('box', boxId)
   .order('created_at', { ascending: true }); // add ordering — otherwise message order isn't guaranteed

   if(messageError) {
      return res.status(500).json({
         success: false,
         message: 'Chat doesn\'t exist'
      })
   }

   res.status(200).json({
      success: true,
      messages: messages
   })
})