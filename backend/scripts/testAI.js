const { OpenAI } = require('openai');

require('dotenv').config();

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: '',
});

async function testGPT() {
  const response = await openai.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      {
        role: 'user',
        content: '¿Dame la ficha tecnica de ASUS-TUF-A15-FA506IC?',
      },
    ],
  });

  console.log('Respuesta:', response.choices[0].message.content);
}

testGPT();
