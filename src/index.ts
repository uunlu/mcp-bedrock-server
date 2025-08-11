import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
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
    log('🚀 Initializing Bedrock MCP Server with Converse API for Claude 4');
    
    this.server = new Server(
      {
        name: 'bedrock-server',
        version: '0.3.0',
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

    log(`✅ Initialized Bedrock client with Converse API for region: ${process.env.AWS_REGION || 'us-east-1'}`);
    this.setupHandlers();
  }

  private setupHandlers() {
    log('🔧 Setting up MCP request handlers with Converse API');
    
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      log('📋 COPILOT CONNECTED! Using Converse API for Claude 4');
      
      const tools = {
        tools: [
          {
            name: 'invoke_claude',
            description: 'Invoke Claude models using AWS Bedrock Converse API (supports Claude 4!)',
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
                    // Claude 4 models (using Converse API)
                    'anthropic.claude-opus-4-1-20250805-v1:0',      // 🥇 Claude Opus 4.1 (NEWEST!)
                    'anthropic.claude-sonnet-4-20250514-v1:0',      // 🥈 Claude Sonnet 4
                    'anthropic.claude-opus-4-20250514-v1:0',        // 🥉 Claude Opus 4
                    'anthropic.claude-3-7-sonnet-20250219-v1:0',    // Claude 3.7 Sonnet
                    // Claude 3.5 models (work with both APIs)
                    'anthropic.claude-3-5-sonnet-20241022-v2:0',    // Claude 3.5 Sonnet v2
                    'anthropic.claude-3-5-sonnet-20240620-v1:0',    // Claude 3.5 Sonnet v1
                    'anthropic.claude-3-5-haiku-20241022-v1:0',     // Claude 3.5 Haiku
                    'anthropic.claude-3-haiku-20240307-v1:0'        // Claude 3 Haiku
                  ],
                  default: 'anthropic.claude-opus-4-1-20250805-v1:0'
                },
                max_tokens: {
                  type: 'number',
                  description: 'Maximum tokens to generate',
                  default: 4096,
                  minimum: 1,
                  maximum: 8192
                },
                temperature: {
                  type: 'number',
                  description: 'Sampling temperature (0.0 to 1.0)',
                  default: 0.7,
                  minimum: 0.0,
                  maximum: 1.0
                },
                top_p: {
                  type: 'number', 
                  description: 'Top-p sampling (0.0 to 1.0)',
                  default: 0.9,
                  minimum: 0.0,
                  maximum: 1.0
                }
              },
              required: ['prompt'],
            },
          },
        ],
      };
      
      log('✅ Returning Converse API tools to Copilot', { 
        toolCount: tools.tools.length,
        api: 'Converse API',
        defaultModel: 'Claude Opus 4.1 (Aug 2025)'
      });
      return tools;
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      log('🚀 COPILOT USING CONVERSE API! Received CallTool request', {
        toolName: request.params.name,
        promptLength: (request.params.arguments as any)?.prompt?.length || 0
      });
      
      const { name, arguments: args } = request.params;

      if (name === 'invoke_claude') {
        try {
          const { 
            prompt, 
            model = 'anthropic.claude-opus-4-1-20250805-v1:0',
            max_tokens = 4096,
            temperature = 0.7,
            top_p = 0.9
          } = args as {
            prompt: string;
            model?: string;
            max_tokens?: number;
            temperature?: number;
            top_p?: number;
          };

          // Model names for logging
          const modelNames: Record<string, string> = {
            'anthropic.claude-opus-4-1-20250805-v1:0': '🥇 Claude Opus 4.1 (Aug 2025)',
            'anthropic.claude-sonnet-4-20250514-v1:0': '🥈 Claude Sonnet 4.0',
            'anthropic.claude-opus-4-20250514-v1:0': '🥉 Claude Opus 4.0', 
            'anthropic.claude-3-7-sonnet-20250219-v1:0': '🆕 Claude 3.7 Sonnet',
            'anthropic.claude-3-5-sonnet-20241022-v2:0': 'Claude 3.5 Sonnet v2',
            'anthropic.claude-3-5-sonnet-20240620-v1:0': 'Claude 3.5 Sonnet v1',
            'anthropic.claude-3-5-haiku-20241022-v1:0': '⚡ Claude 3.5 Haiku',
            'anthropic.claude-3-haiku-20240307-v1:0': '💰 Claude 3 Haiku'
          };

          log(`🤖 Calling ${modelNames[model] || model} via Converse API`, {
            model,
            max_tokens,
            temperature,
            top_p,
            promptPreview: prompt.substring(0, 150) + '...'
          });

          // Use Converse API instead of InvokeModel
          const command = new ConverseCommand({
            modelId: model,
            messages: [
              {
                role: "user",
                content: [
                  {
                    text: prompt
                  }
                ]
              }
            ],
            inferenceConfig: {
              maxTokens: max_tokens,
              temperature: temperature,
              topP: top_p
            }
          });

          const startTime = Date.now();
          const response = await this.bedrockClient.send(command);
          const responseTime = Date.now() - startTime;

          // Extract response text from Converse API format
          const responseText = response.output?.message?.content?.[0]?.text || 'No response received';

          log(`✅ SUCCESS! ${modelNames[model] || model} responded via Converse API`, {
            responseTime: `${responseTime}ms`,
            responseLength: responseText.length,
            usage: response.usage,
            inputTokens: response.usage?.inputTokens,
            outputTokens: response.usage?.outputTokens,
            totalTokens: response.usage?.totalTokens,
            preview: responseText.substring(0, 200) + '...'
          });

          return {
            content: [
              {
                type: 'text',
                text: responseText,
              },
            ],
          };
        } catch (error: any) {
          log('❌ ERROR with Converse API', {
            error: error instanceof Error ? error.message : String(error),
            errorCode: error?.name,
            statusCode: error?.$metadata?.httpStatusCode,
            requestId: error?.$metadata?.requestId
          });

          // Enhanced error handling for Converse API
          let errorMessage = `Error with Converse API: ${error instanceof Error ? error.message : String(error)}`;
          
          if (error?.name === 'ValidationException') {
            errorMessage += '\n\n💡 Tip: Check if the model ID is correct and supports Converse API.';
          } else if (error?.name === 'AccessDeniedException') {
            errorMessage += '\n\n💡 Tip: You may need to request access to this model in the AWS Bedrock console.';
          } else if (error?.name === 'ResourceNotFoundException') {
            errorMessage += '\n\n💡 Tip: This model might not be available in your region. Try a different model.';
          } else if (error?.$metadata?.httpStatusCode === 429) {
            errorMessage += '\n\n💡 Tip: Rate limit exceeded. Try again in a moment.';
          }
          
          return {
            content: [
              {
                type: 'text',
                text: errorMessage,
              },
            ],
            isError: true,
          };
        }
      }

      log('❌ Unknown tool requested', { toolName: name });
      throw new Error(`Unknown tool: ${name}`);
    });
    
    log('✅ MCP handlers ready with Converse API - supports Claude 4!');
  }

  async run() {
    log('🎯 Starting Bedrock MCP server with Converse API for Claude 4 support');
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    log('🟢 MCP server running with Converse API - Claude 4 ready!');
    console.error('Bedrock MCP server running with Converse API for Claude 4 support');
  }
}

// Start the server
const server = new BedrockMCPServer();
server.run().catch((error) => {
  log('💥 Fatal error starting server', error);
  console.error(error);
});
