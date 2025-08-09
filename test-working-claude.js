require('dotenv').config();
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const client = new BedrockRuntimeClient({
  region: 'us-east-1',
});

async function testClaude() {
  try {
    // Try Claude V2 (usually works without special access)
    const body = JSON.stringify({
      prompt: "\n\nHuman: Hello! Please respond with 'Connection successful!'\n\nAssistant:",
      max_tokens_to_sample: 100,
      temperature: 0.1,
    });

    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-v2',
      body: body,
      contentType: 'application/json',
      accept: 'application/json',
    });

    console.log('🧪 Testing Claude V2...');
    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    console.log('✅ SUCCESS! Claude V2 is working!');
    console.log('Response:', responseBody.completion);
    
    return 'anthropic.claude-v2';
    
  } catch (error) {
    console.log('❌ Claude V2 failed:', error.message);
    console.log('This suggests a permissions issue. Let\'s check user permissions...');
    return null;
  }
}

testClaude();
