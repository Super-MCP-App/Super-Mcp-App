// Test real Figma API with the saved access token - NOTE: set ACCESS_TOKEN from your .env or DB
const ACCESS_TOKEN = process.env.FIGMA_TEST_TOKEN || 'your_figma_access_token_here';

async function figmaFetch(endpoint) {
  const res = await fetch(`https://api.figma.com/v1${endpoint}`, {
    headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` },
  });
  const data = await res.json();
  console.log(`GET ${endpoint} → ${res.status}:`, JSON.stringify(data).substring(0, 500));
  return { status: res.status, data };
}

// Test 1: Get user profile (should work with current_user:read)
console.log('\n=== Test 1: /me ===');
await figmaFetch('/me');

// Test 2: List team projects (requires team_id which we don't have)
console.log('\n=== Test 2: /me (for other fields) ===');
const me = await figmaFetch('/me');
const teamId = me.data?.teams?.[0]?.id;
console.log('Team ID from profile:', teamId);

process.exit();
