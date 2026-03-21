// MCP Tool Registry
// Maps connected MCP providers to OpenAI function-calling tools

import { figmaGetFile, figmaGetImages } from './figma';
// Note: You'd implement Canva/Kite APIs similarly

export function getAvailableTools(connections = {}) {
  const tools = [];

  // If user connected Figma
  if (connections.figma?.status === 'connected') {
    tools.push({
      type: 'function',
      function: {
        name: 'mcp_figma_read_file',
        description: 'Read the structure and text of a Figma design file.',
        parameters: {
          type: 'object',
          properties: {
            fileKey: { type: 'string', description: 'The unique Figma file key from the URL' },
          },
          required: ['fileKey'],
        },
      },
    });
  }

  // If user connected Canva
  if (connections.canva?.status === 'connected') {
    tools.push({
      type: 'function',
      function: {
        name: 'mcp_canva_export',
        description: 'Export a Canva design to a specific format.',
        parameters: {
          type: 'object',
          properties: {
            designId: { type: 'string', description: 'The unique Canva design ID' },
            format: { type: 'string', enum: ['png', 'pdf', 'jpg'], description: 'Export format' },
          },
          required: ['designId', 'format'],
        },
      },
    });
  }

  // If user connected Kite
  if (connections.kite?.status === 'connected') {
    tools.push({
      type: 'function',
      function: {
        name: 'mcp_kite_search',
        description: 'Search for financial or stock market data via Kite.',
        parameters: {
          type: 'object',
          properties: {
            symbol: { type: 'string', description: 'Stock ticker symbol (e.g., RELIANCE)' },
          },
          required: ['symbol'],
        },
      },
    });
  }

  return tools;
}

export async function executeTool(toolName, args, connections = {}) {
  try {
    switch (toolName) {
      case 'mcp_figma_read_file':
        if (!connections.figma?.access_token) throw new Error('Figma not authenticated');
        // If we had a real figma lib, we'd call it here
        // return await figmaGetFile(connections.figma.access_token, args.fileKey);
        return { success: true, metadata: { name: 'Figma Mock Design' }, nodes: [] };
        
      case 'mcp_canva_export':
        if (!connections.canva?.access_token) throw new Error('Canva not authenticated');
        return { success: true, url: `https://canva.mock/export/${args.designId}.${args.format}` };
        
      case 'mcp_kite_search':
        if (!connections.kite?.access_token) throw new Error('Kite not authenticated');
        return { success: true, symbol: args.symbol, currentPrice: 2500.50, trend: 'up' };

      default:
        return { error: `Tool ${toolName} not registered or recognized.` };
    }
  } catch (error) {
    console.error(`Error executing MCP tool ${toolName}:`, error);
    return { error: error.message };
  }
}
