import { streamText } from 'ai';
import { aiSdkOpenAI } from '../utils/openaiClient.js'; // adjust path to wherever openaiClient.js lives
import { convertToVectorEmbeddings } from '../business-logic/convert-to-vector-embeddings.logic.js';
import { supabase } from '../db/supabaseDB.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const initChatBox = asyncHandler(async(req,res)=>{
   const videoId = req.params.videoId;
   const user = req.user.id;

   const {data,error} = await supabase.from('Videos')
   .select('*')
   .eq('id',videoId)
   .single()
   
   if(error) {
      return res.status(500).json({
         success: false,
         message: `Internal server error: ${JSON.stringify(error)}`
      })
   }
   if(!data) {
      return res.status(404).json({
         success: false,
         message: 'Video is not found'
      })
   }
   if(data.user !== user) {
      return res.status(403).json({   // 403, not 400 — this is an authorization failure
         success: false,
         message: 'Unauthorized access to the video'
      })
   }
   
   const {data: box, error: boxError} = await supabase.from('Box')
   .insert({
      user: user,
      video: videoId
   })
   .select()
   .single()

   if(boxError){
      return res.status(500).json({
         success: false,
         message: `Internal server error: ${JSON.stringify(boxError)}`
      })
   }

   res.status(200).json({
      success: true,
      message: 'Successfully initialized a chat box and returned its Id',
      body: box.id
   })
})

export const responseMessage = asyncHandler(async(req,res)=>{
   const message = req.body.message;
   const chatId = req.params.chatId;
   const userId = req.user.id;

   // embed the user's message — pass as array, pull out just the numeric vector
   const embeddingResult = await convertToVectorEmbeddings([message]);
   const queryEmbedding = embeddingResult[0].embedding;

   const {data: box, error: boxError} = await supabase.from('Box')
   .select('video, user')
   .eq('id',chatId)
   .single()

   if(boxError) {
      return res.status(500).json({ success: false, message: `Error in chat instance formation: ${JSON.stringify(boxError)}` })
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
      return res.status(500).json({ success: false, message: `Failed to fetch matching documents: ${JSON.stringify(matchError)}` })
   }

   const { data: history, error: historyError } = await supabase.from('Chats')
   .select('user_query, response')
   .eq('box', chatId)
   .order('created_at', { ascending: true })
   .limit(6);
   if(historyError) {
      return res.status(500).json({ success: false, message: `Failed to fetch the previous chat messages: ${JSON.stringify(historyError)}` })
   }

   const transcriptContext = chunks.length
      ? chunks.map(c => c.body).join('\n\n')
      : 'No relevant transcript sections found.';
   
   const conversationContext = history
      .map(h => `User: ${h.user_query}\nAssistant: ${h.response}`)
      .join('\n\n');

   res.setHeader('Content-Type', 'text/event-stream');
   res.setHeader('Cache-Control', 'no-cache, no-transform');
   res.setHeader('Connection', 'keep-alive');
   res.setHeader('X-Accel-Buffering', 'no');

   const result = streamText({
      model: aiSdkOpenAI('gpt-4o-mini'),
      system: `You are answering questions about a video, using transcript excerpts as your source of truth.

   Transcript context:
   ${transcriptContext}

   Conversation so far:
   ${conversationContext}`,
      prompt: message,
   });

   result.pipeUIMessageStreamToResponse(res);

   const fullText = await result.text;
   console.log('\n--- Full AI response ---\n', fullText, '\n------------------------\n');

   await supabase.from('Chats').insert({
      user_query: message,
      response: fullText,
      box: chatId
   });
})

export const getChatHistory = asyncHandler(async(req,res)=>{
   const userId = req.user.id;

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
   const userId = req.user.id;

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

/*export const deleteChats = asyncHandler(async(req,res)=>{
   const boxId = req.params.chatId; 

   const {data: box,error: boxError} = await supabase.from('Box') //Fetch the details
   .select('*')
   .eq('id',chatId)
   .single()
   
   if(!box) { //Check existence
      return res.status(404).json({
         success:false,
         message:'No such chat boxes found'
      })
   }

   if(boxError) {
      return res.status(500).json({
      success: false,
      message: JSON.stringify(chatError)
      })
   }

   //Delete the chat box first
   const {deleteError: error} = await supabase.from('Box')
   .delete()
   .eq('id',boxId)
   .select()

   if(deleteError) {
      return res.status(500).json({
      success: false,
      message: JSON.stringify(deleteError)
      })
   }
   

   //Get chats next 
   const {chat: data, chatError:error} = await supabase.from('Chats')
   .select('*') 
   .eq('box',boxId)
   
   if(chatError){
      return res.status(500).json({
      success: false,
      message: JSON.stringify(chatError)
      })
   }

   //Delete all chat messages
   const {deleteChatError: error} = await supabase.from("'Vi")
})*/