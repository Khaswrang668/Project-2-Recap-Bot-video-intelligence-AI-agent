import OpenAI from "openai";
import 'dotenv/config';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

export const convertToVectorEmbeddings = async (textChunks)=>{

const embedding = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: textChunks,
  encoding_format: "float",
});

return embedding.data;
}