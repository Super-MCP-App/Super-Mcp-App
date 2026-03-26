// Figma API Client — OAuth2 flow + API methods
const FIGMA_API_BASE = 'https://api.figma.com/v1';
const FIGMA_OAUTH_URL = 'https://www.figma.com/oauth';

export function getFigmaAuthUrl(state) {
  const params = new URLSearchParams({
    client_id: process.env.FIGMA_CLIENT_ID,
    redirect_uri: process.env.NEXT_PUBLIC_FIGMA_REDIRECT_URI,
    scope: 'current_user:read,file_content:read',
    state: state || '',
    response_type: 'code',
  });
  return `${FIGMA_OAUTH_URL}?${params.toString()}`;
}

export async function exchangeFigmaToken(code) {
  const credentials = Buffer.from(`${process.env.FIGMA_CLIENT_ID}:${process.env.FIGMA_CLIENT_SECRET}`).toString('base64');
  const res = await fetch('https://api.figma.com/v1/oauth/token', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      redirect_uri: process.env.NEXT_PUBLIC_FIGMA_REDIRECT_URI,
      code,
      grant_type: 'authorization_code',
    }),
  });
  const data = await res.json();
  console.log('[Figma] Token exchange response status:', res.status, JSON.stringify(data).substring(0, 200));
  return data;
}

export async function refreshFigmaToken(refreshToken) {
  const res = await fetch('https://www.figma.com/api/oauth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.FIGMA_CLIENT_ID,
      client_secret: process.env.FIGMA_CLIENT_SECRET,
      refresh_token: refreshToken,
    }),
  });
  return res.json();
}

// API methods
async function figmaFetch(endpoint, accessToken) {
  const res = await fetch(`${FIGMA_API_BASE}${endpoint}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Figma API error: ${res.status}`);
  return res.json();
}

export async function getFigmaUser(accessToken) {
  return figmaFetch('/me', accessToken);
}

export async function getFigmaFiles(accessToken, projectId) {
  return figmaFetch(`/projects/${projectId}/files`, accessToken);
}

export async function getFigmaFile(accessToken, fileKey) {
  return figmaFetch(`/files/${fileKey}`, accessToken);
}

export async function getFigmaImages(accessToken, fileKey, nodeIds, format = 'png') {
  const ids = Array.isArray(nodeIds) ? nodeIds.join(',') : nodeIds;
  return figmaFetch(`/images/${fileKey}?ids=${ids}&format=${format}`, accessToken);
}

export async function getFigmaComments(accessToken, fileKey) {
  return figmaFetch(`/files/${fileKey}/comments`, accessToken);
}

export async function getFigmaTeamProjects(accessToken, teamId) {
  return figmaFetch(`/teams/${teamId}/projects`, accessToken);
}

export async function getFigmaStyles(accessToken, fileKey) {
  const data = await figmaFetch(`/files/${fileKey}`, accessToken);
  return data.styles || {};
}

export async function getFigmaProjects(accessToken, teamId) {
  return figmaFetch(`/teams/${teamId}/projects`, accessToken);
}

export async function createFigmaFile(accessToken, projectId, name) {
  const res = await fetch(`${FIGMA_API_BASE}/projects/${projectId}/files`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(`Figma File Creation Failed: ${error.message || res.status}`);
  }
  return res.json();
}
