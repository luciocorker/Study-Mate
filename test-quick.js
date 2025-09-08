// Quick test of API functionality
fetch('http://localhost:3001/api/generate-ai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt: 'Hello, test', userId: 'test' })
})
.then(res => res.json())
.then(data => console.log('API working:', data.result))
.catch(err => console.error('API error:', err));
