require('dotenv').config();
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const client = new BedrockRuntimeClient({
  region: 'us-east-1',
});

async function testWorkingProfile() {
  try {
    console.log('🧪 Testing inference profile: us.anthropic.claude-3-sonnet-20240229-v1:0...');
    
    const body = JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content: "Hello! Please respond with 'Connection successful!' to confirm this is working."
        }
      ]
    });

    const command = new InvokeModelCommand({
      modelId: 'us.anthropic.claude-3-sonnet-20240229-v1:0',
      body: body,
      contentType: 'application/json',
      accept: 'application/json',
    });

    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    console.log('✅ SUCCESS! Inference profile is working!');
    console.log('Claude response:', responseBody.content[0].text);
    
    return 'us.anthropic.claude-3-sonnet-20240229-v1:0';
    
  } catch (error) {
    console.log('❌ Failed:', error.message);
    return null;
  }
}

testWorkingProfile();
