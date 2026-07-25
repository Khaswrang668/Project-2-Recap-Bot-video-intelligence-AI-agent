import OpenAI from 'openai';
import { createOpenAI } from '@ai-sdk/openai';

export const openai = new OpenAI({
  baseURL: 'https://api.aicredits.in/v1',
  apiKey: process.env.OPENAI_API_KEY, // your AICredits key
});

// AI SDK provider — used specifically for streamText/chat in chat.controller.js
export const aiSdkOpenAI = createOpenAI({
  baseURL: 'https://api.aicredits.in/v1',
  apiKey: process.env.OPENAI_API_KEY,
});