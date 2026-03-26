// Test the exact Figma token exchange logic
const client_id = process.env.FIGMA_CLIENT_ID;
const client_secret = process.env.FIGMA_CLIENT_SECRET;
const redirect_uri = process.env.NEXT_PUBLIC_FIGMA_REDIRECT_URI;

const credentials = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

console.log('Testing Figma token exchange endpoint...');
console.log('Client ID:', client_id);
console.log('Redirect URI:', redirect_uri);
console.log('Basic Auth header:', `Basic ${credentials.substring(0, 10)}...`);

// We don't have a live code, but we can test the endpoint format is correct
const res = await fetch('https://api.figma.com/v1/oauth/token', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': `Basic ${credentials}`,
  },
  body: new URLSearchParams({
    redirect_uri,
    code: 'fake_code_123',
    grant_type: 'authorization_code',
  }),
});

const data = await res.json();
console.log('Response status:', res.status);
console.log('Response body:', JSON.stringify(data, null, 2));
process.exit();
