import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

// Load environment variables
dotenv.config();

// File logging function
function log(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logMessage = `[MCP-BEDROCK] ${timestamp}: ${message}${data ? '\n' + JSON.stringify(data, null, 2) : ''}\n`;
  
  // Log to both stderr and file
  console.error(`[MCP-BEDROCK] ${timestamp}: ${message}`);
  if (data) {
    console.error(`[MCP-BEDROCK] Data:`, JSON.stringify(data, null, 2));
  }
  
  // Also log to file
  try {
    fs.appendFileSync('/tmp/mcp-bedrock.log', logMessage);
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
}

class BedrockMCPServer {
  private server: Server;
  private bedrockClient: BedrockRuntimeClient;

  constructor() {
    log('🚀 Initializing Bedrock MCP Server');
    
    this.server = new Server(
      {
        name: 'bedrock-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize Bedrock client
    this.bedrockClient = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });

    log(`✅ Initialized Bedrock client for region: ${process.env.AWS_REGION || 'us-east-1'}`);
    this.setupHandlers();
  }

  private setupHandlers() {
    log('🔧 Setting up MCP request handlers');
    
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      log('📋 COPILOT CONNECTED! Received ListTools request');
      
      const tools = {
        tools: [
          {
            name: 'invoke_claude',
            description: 'Invoke Claude 3.5 Sonnet model on AWS Bedrock',
            inputSchema: {
              type: 'object',
              properties: {
                prompt: {
                  type: 'string',
                  description: 'The prompt to send to Claude',
                },
                model: {
                  type: 'string',
                  description: 'The Claude model to use',
                  enum: [
                    'us.anthropic.claude-opus-4-20250514-v1:0',      // Claude 4 Opus (primary)
                    'us.anthropic.claude-3-5-sonnet-20240620-v1:0',  // Claude 3.5 Sonnet (fallback)
                    'us.anthropic.claude-3-5-haiku-20241022-v1:0',   // Claude 3.5 Haiku (fast)
                    'us.anthropic.claude-3-opus-20240229-v1:0'       // Claude 3 Opus
                  ],
                  default: 'us.anthropic.claude-sonnet-4-20250514-v1:0'  // Default to Claude 4
                },
                max_tokens: {
                  type: 'number',
                  description: 'Maximum tokens to generate',
                  default: 4096
                }
              },
              required: ['prompt'],
            },
          },
        ],
      };
      
      log('✅ Returning tools to Copilot', { toolCount: tools.tools.length });
      return tools;
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      log('🚀 COPILOT USING BEDROCK! Received CallTool request', {
        toolName: request.params.name,
        promptLength: (request.params.arguments as any)?.prompt?.length || 0
      });
      
      const { name, arguments: args } = request.params;

      if (name === 'invoke_claude') {
        try {
          const { prompt, model = 'us.anthropic.claude-sonnet-4-20250514-v1:0', max_tokens = 4096 } = args as {
            prompt: string;
            model?: string;
            max_tokens?: number;
          };

          log('🤖 Calling Claude 4.0 Sonnet via AWS Bedrock', {
            model,
            max_tokens,
            promptPreview: prompt.substring(0, 100) + '...'
          });

          const body = JSON.stringify({
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: max_tokens,
            messages: [
              {
                role: "user",
                content: prompt
              }
            ]
          });

          const command = new InvokeModelCommand({
            modelId: model,
            body: body,
            contentType: 'application/json',
            accept: 'application/json',
          });

          const response = await this.bedrockClient.send(command);
          const responseBody = JSON.parse(new TextDecoder().decode(response.body));

          log('✅ SUCCESS! Claude responded via Bedrock', {
            responseLength: responseBody.content[0].text.length,
            usage: responseBody.usage,
            preview: responseBody.content[0].text.substring(0, 100) + '...'
          });

          return {
            content: [
              {
                type: 'text',
                text: responseBody.content[0].text,
              },
            ],
          };
        } catch (error) {
          log('❌ ERROR invoking Claude', {
            error: error instanceof Error ? error.message : String(error)
          });
          
          return {
            content: [
              {
                type: 'text',
                text: `Error invoking Claude: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
            isError: true,
          };
        }
      }

      log('❌ Unknown tool requested', { toolName: name });
      throw new Error(`Unknown tool: ${name}`);
    });
    
    log('✅ MCP handlers ready - waiting for Copilot connections');
  }

  async run() {
    log('🎯 Starting Bedrock MCP server - ready for Copilot!');
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    log('🟢 MCP server running and connected!');
    console.error('Bedrock MCP server running on stdio');
  }
}

// Start the server
const server = new BedrockMCPServer();
server.run().catch((error) => {
  log('💥 Fatal error starting server', error);
  console.error(error);
});
