import openai from '../openaiClient.js';

export const convertToVectorEmbeddings = async (textChunks)=>{

const embedding = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: textChunks,
  encoding_format: "float",
});

return embedding.data;
}