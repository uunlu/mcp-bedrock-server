require('dotenv').config();
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const client = new BedrockRuntimeClient({
  region: 'us-east-1',
});

async function testCrossRegion() {
  // Models you already have access to (Cross-region inference)
  const modelsToTry = [
    'anthropic.claude-3-5-haiku-20241022-v1:0',
    'anthropic.claude-3-7-sonnet-20250219-v1:0', 
    'anthropic.claude-sonnet-4-20250514-v1:0',
    'anthropic.claude-opus-4-20250514-v1:0'
  ];

  for (const modelId of modelsToTry) {
    try {
      console.log('\n🧪 Testing ' + modelId + '...');
      
      const body = JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 50,
        messages: [
          {
            role: "user",
            content: "Hello! Please respond with 'Connection successful!'"
          }
        ]
      });

      const command = new InvokeModelCommand({
        modelId: modelId,
        body: body,
        contentType: 'application/json',
        accept: 'application/json',
      });

      const response = await client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      console.log('✅ SUCCESS with ' + modelId + '!');
      console.log('Response:', responseBody.content[0].text);
      
      // Found a working model!
      console.log('\n🎉 WORKING MODEL: ' + modelId);
      return modelId;
      
    } catch (error) {
      console.log('❌ Failed: ' + error.message);
    }
  }
}

testCrossRegion();
