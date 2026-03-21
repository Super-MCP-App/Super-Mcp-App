// Canva Connect API Client — OAuth2 flow + API methods
const CANVA_API_BASE = 'https://api.canva.com/rest/v1';
const CANVA_AUTH_URL = 'https://www.canva.com/api/oauth/authorize';

export function getCanvaAuthUrl(state) {
  const params = new URLSearchParams({
    client_id: process.env.CANVA_CLIENT_ID,
    redirect_uri: process.env.NEXT_PUBLIC_CANVA_REDIRECT_URI,
    response_type: 'code',
    scope: 'design:content:read design:content:write design:meta:read',
    state: state || '',
  });
  return `${CANVA_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCanvaToken(code) {
  const credentials = Buffer.from(
    `${process.env.CANVA_CLIENT_ID}:${process.env.CANVA_CLIENT_SECRET}`
  ).toString('base64');

  const res = await fetch('https://api.canva.com/rest/v1/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.NEXT_PUBLIC_CANVA_REDIRECT_URI,
    }),
  });
  return res.json();
}

export async function refreshCanvaToken(refreshToken) {
  const credentials = Buffer.from(
    `${process.env.CANVA_CLIENT_ID}:${process.env.CANVA_CLIENT_SECRET}`
  ).toString('base64');

  const res = await fetch('https://api.canva.com/rest/v1/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });
  return res.json();
}

// API methods
async function canvaFetch(endpoint, accessToken, options = {}) {
  const res = await fetch(`${CANVA_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error(`Canva API error: ${res.status}`);
  return res.json();
}

export async function getCanvaUser(accessToken) {
  return canvaFetch('/users/me', accessToken);
}

export async function listCanvaDesigns(accessToken, query = {}) {
  const params = new URLSearchParams(query).toString();
  return canvaFetch(`/designs?${params}`, accessToken);
}

export async function getCanvaDesign(accessToken, designId) {
  return canvaFetch(`/designs/${designId}`, accessToken);
}

export async function createCanvaDesign(accessToken, data) {
  return canvaFetch('/designs', accessToken, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function exportCanvaDesign(accessToken, designId, format = 'png') {
  return canvaFetch(`/designs/${designId}/exports`, accessToken, {
    method: 'POST',
    body: JSON.stringify({ format }),
  });
}
