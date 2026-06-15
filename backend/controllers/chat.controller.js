import { supabase } from "../db/supabaseDB";
import { asyncHandler } from "../utils/asyncHandler.js";
import { convertToVectorEmbeddings } from "./convert-to-vector-embeddings.logic.js";

export const responseMessage = asyncHandler(async(req,res)=>{
   const message = req.body.message;

   //Convert the message into a vector embedding
   const queryEmbedding = convertToVectorEmbeddings(message);

   //Retrive relevent results/embeddings from vector db
   const releventResults = await supabase.rpc()

})