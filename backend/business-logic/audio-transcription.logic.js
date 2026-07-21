import openai from '../openaiClient.js';
import fs from 'fs';


export const transcriptAudio = async(filepath) =>{
    const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(filepath),
        model: 'whisper-1'
    })
    console.log(transcription.text);
    return transcription.text;
}

