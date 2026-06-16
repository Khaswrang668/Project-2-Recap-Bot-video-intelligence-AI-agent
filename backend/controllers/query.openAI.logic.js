import OpenAI from "openai";

const openai = new OpenAI({ 
    apiKey: process.env.OPENAI_API_KEY 
});

export const getAIResponse = async ((userQuery,context)=>{
const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a helpful assistant. Answer the user's question using only the context below.
        
Context:
${context}`
      },
      {
        role: 'user',
        content: userQuery
      }
    ]
});

  return completion.choices[0].message.content;
})
