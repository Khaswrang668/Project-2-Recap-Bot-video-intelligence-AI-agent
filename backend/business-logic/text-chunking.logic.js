import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export const textSplitter = async (transcript)=>{

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 50,
});

const output = await splitter.splitText(transcript);

return output;
}