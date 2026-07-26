import { openai } from '../utils/openaiClient.js';
import { toFile } from 'openai/uploads';
import fs from 'fs';
import path from 'path';

export const transcriptAudio = async(filepath) =>{
    try{
    const buffer = fs.readFileSync(filepath);
    const file = await toFile(buffer, path.basename(filepath));

    const transcription = await openai.audio.transcriptions.create({
        file,
        model: 'whisper-1'
    })
    return transcription.text;
    }
    catch(error){
    console.log(`Error in transcription: ${error.message}`)
    }
}