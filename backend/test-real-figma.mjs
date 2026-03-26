

const client_id = process.env.FIGMA_CLIENT_ID;
const redirect_uri = process.env.NEXT_PUBLIC_FIGMA_REDIRECT_URI;
// Using the exact simplified scopes we deployed
const scope = 'current_user:read,file_content:read';

if (!client_id || !redirect_uri) {
  console.error("Missing FIGMA_CLIENT_ID or NEXT_PUBLIC_FIGMA_REDIRECT_URI in your .env file!");
  process.exit(1);
}

const params = new URLSearchParams({
  client_id,
  redirect_uri,
  scope,
  state: 'test_state_123',
  response_type: 'code',
});

const authUrl = `https://www.figma.com/oauth?${params.toString()}`;

console.log("\n=======================================================");
console.log("👉 CLICK THIS URL TO TEST REAL FIGMA AUTHORIZATION 👈");
console.log("=======================================================\n");
console.log(authUrl);
console.log("\n=======================================================\n");
