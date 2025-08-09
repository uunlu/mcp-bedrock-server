require('dotenv').config();
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const client = new BedrockRuntimeClient({
  region: 'us-east-1',
});

async function testConnection() {
  try {
    const body = JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content: "Hello! Please respond with 'Connection successful!'"
        }
      ]
    });

    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
      body: body,
      contentType: 'application/json',
      accept: 'application/json',
    });

    console.log('Testing with Claude 3 Sonnet...');
    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    console.log('✅ AWS Bedrock connection successful!');
    console.log('Claude response:', responseBody.content[0].text);
  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
}

testConnection();
