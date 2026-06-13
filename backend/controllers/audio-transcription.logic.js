import OpenAI from "openai";
import 'dotenv/config';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

export const transcriptAudio = async(filepath) =>{
    const transcription = await openai.audio.transcriptions({
        file: filepath,
        model: 'wishper-1'
    })
    console.log(transcription);
    return transcription;
}