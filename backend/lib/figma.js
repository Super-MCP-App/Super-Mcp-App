// Figma API Client — OAuth2 flow + API methods
const FIGMA_API_BASE = 'https://api.figma.com/v1';
const FIGMA_OAUTH_URL = 'https://www.figma.com/oauth';

export function getFigmaAuthUrl(state) {
  const params = new URLSearchParams({
    client_id: process.env.FIGMA_CLIENT_ID,
    redirect_uri: process.env.NEXT_PUBLIC_FIGMA_REDIRECT_URI,
    scope: 'current_user:read,file_comments:read,file_comments:write,file_content:read,file_metadata:read,file_versions:read,library_assets:read,library_content:read,team_library_content:read,file_dev_resources:read,file_dev_resources:write,projects:read,webhooks:read,webhooks:write',
    state: state || '',
    response_type: 'code',
  });
  return `${FIGMA_OAUTH_URL}?${params.toString()}`;
}

export async function exchangeFigmaToken(code) {
  const res = await fetch('https://www.figma.com/api/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.FIGMA_CLIENT_ID,
      client_secret: process.env.FIGMA_CLIENT_SECRET,
      redirect_uri: process.env.NEXT_PUBLIC_FIGMA_REDIRECT_URI,
      code,
      grant_type: 'authorization_code',
    }),
  });
  return res.json();
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
