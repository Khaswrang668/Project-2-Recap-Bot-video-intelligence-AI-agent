import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export const textSplitter = async (transcript)=>{

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 100,
  chunkOverlap: 10,
});

const output = await splitter.splitText(transcript);

return output;
}