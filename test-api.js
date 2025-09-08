import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

async function testGeminiAPI() {
  
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('Testing Gemini API...');
  console.log('API Key (first 10 chars):', apiKey?.substring(0, 10) + '...');
  
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Hello, say hi back!'
          }]
        }]
      })
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error response:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('Success! Response:', JSON.stringify(data, null, 2));
    
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('Generated text:', result);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testGeminiAPI();
