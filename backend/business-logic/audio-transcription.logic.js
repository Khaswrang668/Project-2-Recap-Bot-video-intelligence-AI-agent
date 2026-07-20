import OpenAI from "openai";
import 'dotenv/config';
import fs from 'fs';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

export const transcriptAudio = async(filepath) =>{
    const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(filepath),
        model: 'whisper-1'
    })
    console.log(transcription.text);
    return transcription.text;
}

