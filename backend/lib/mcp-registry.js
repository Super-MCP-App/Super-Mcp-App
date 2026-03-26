// MCP Tool Registry
// Maps connected MCP providers to OpenAI function-calling tools

import { 
  getFigmaFiles, 
  getFigmaFile, 
  getFigmaImages,
  getFigmaStyles 
} from './figma';

export function getAvailableTools(connections = {}) {
  const tools = [];

  // Figma tools are added regardless of connection state so the AI knows they exist
  // and can prompt the user to connect if they try to use them.
  tools.push(
    {
      type: 'function',
      function: {
        name: 'figma_get_files',
        description: "Get user's Figma files. Call this when the user asks to see their Figma files or projects. If they are not connected to Figma, this will return an error instructing them to connect.",
        parameters: {
          type: 'object',
          properties: {},
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'figma_get_file',
        description: 'Get details, structure, and nodes of a specific Figma file.',
        parameters: {
          type: 'object',
          properties: {
            file_key: { type: 'string', description: 'The unique Figma file key from the URL' },
          },
          required: ['file_key'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'figma_export_frame',
        description: 'Export a specific frame or node from a Figma file as an image.',
        parameters: {
          type: 'object',
          properties: {
            file_key: { type: 'string', description: 'The unique Figma file key' },
            node_id: { type: 'string', description: 'The specific node ID (e.g., 1:2)' },
            format: { type: 'string', enum: ['png', 'jpg', 'svg', 'pdf'], description: 'Export format' },
          },
          required: ['file_key', 'node_id', 'format'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'figma_get_styles',
        description: 'Extract colors, typography, and styles from a Figma design.',
        parameters: {
          type: 'object',
          properties: {
            file_key: { type: 'string', description: 'The unique Figma file key' },
          },
          required: ['file_key'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'figma_analyze_design',
        description: 'Analyze UI/UX of a Figma file and suggest improvements based on its node structure.',
        parameters: {
          type: 'object',
          properties: {
            file_key: { type: 'string', description: 'The unique Figma file key' },
          },
          required: ['file_key'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'figma_create_frame',
        description: '(LIMITED SUPPORT) Simulate UI frame creation.',
        parameters: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            width: { type: 'number' },
            height: { type: 'number' },
          },
          required: ['name', 'width', 'height'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'debug_get_session_info',
        description: 'Get current session and connection debug info. Use this to help the developer debug why a connection might be missing.',
        parameters: {
          type: 'object',
          properties: {},
        },
      },
    }
  );

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
  console.log(`[MCP Registry] Executing ${toolName}. Connections:`, Object.keys(connections).join(', '));
  try {
    // Shared validation for Figma tools
    if (toolName.startsWith('figma_')) {
      const figmaToken = connections.figma?.access_token;
      const isConnected = connections.figma?.status === 'connected';
      console.log(`[MCP Registry] Figma Connection Check: token=${!!figmaToken}, status=${connections.figma?.status}`);

      if (!figmaToken || !isConnected) {
        return { 
          error: "NOT_CONNECTED", 
          message: "User is not connected to Figma. Tell the user: 'Please connect your Figma account first.' and emit the open_connect_figma_screen trigger in your response text."
        };
      }
    }

    const figmaToken = connections.figma?.access_token;

    switch (toolName) {
      case 'figma_get_files': {
        const figmaUser = await getFigmaUser(figmaToken);
        return { 
          source: 'figma',
          connected_as: figmaUser.handle || figmaUser.email,
          message: "Figma account is connected! To access a specific file, please share the Figma file URL (e.g. https://www.figma.com/file/XXXXXX/FileName). I can then read its contents, styles, and components.",
          tip: "The Figma API does not support listing all files without a Team ID. Share a specific file URL to get started."
        };
      }

      case 'debug_get_session_info': {
        return {
          status: 'success',
          connections_present: Object.keys(connections),
          figma_details: connections.figma ? { status: connections.figma.status, has_token: !!connections.figma.access_token } : 'missing',
          help: "If Figma is missing here, the messages API did not find a row in the connected_apps table for your current user ID."
        };
      }

      case 'figma_get_file':
        return await getFigmaFile(figmaToken, args.file_key);
        
      case 'figma_export_frame':
        return await getFigmaImages(figmaToken, args.file_key, args.node_id, args.format);

      case 'figma_get_styles':
        return await getFigmaStyles(figmaToken, args.file_key);

      case 'figma_analyze_design':
        const fileData = await getFigmaFile(figmaToken, args.file_key);
        return {
          success: true,
          action_required: "Analyze the provided file structure and suggest UX/UI improvements.",
          document_structure: fileData.document // Send the document tree back to the AI for analysis
        };

      case 'figma_create_frame':
        return { 
          success: false, 
          message: `Figma API has limitations for full UI creation. I cannot dynamically create a frame named '${args.name}' (${args.width}x${args.height}) directly via the REST API. I can generate a design structure or guide you instead.` 
        };
        
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
