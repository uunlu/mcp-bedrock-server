require('dotenv').config();
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const client = new BedrockRuntimeClient({
  region: 'us-east-1',
});

async function testAllClaude() {
  const modelsToTry = [
    'anthropic.claude-v2',
    'anthropic.claude-instant-v1', 
    'anthropic.claude-v2:1',
    'anthropic.claude-3-haiku-20240307-v1:0'
  ];

  for (const modelId of modelsToTry) {
    try {
      console.log('\n🧪 Testing ' + modelId + '...');
      
      const isClaudeV2 = modelId.includes('claude-v2') || modelId.includes('instant');
      let body;
      
      if (isClaudeV2) {
        body = JSON.stringify({
          prompt: "\n\nHuman: Say 'working'\n\nAssistant:",
          max_tokens_to_sample: 10,
          temperature: 0.1,
        });
      } else {
        body = JSON.stringify({
          anthropic_version: "bedrock-2023-05-31",
          max_tokens: 10,
          messages: [{ role: "user", content: "Say 'working'" }]
        });
      }

      const command = new InvokeModelCommand({
        modelId: modelId,
        body: body,
        contentType: 'application/json',
        accept: 'application/json',
      });

      const response = await client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      console.log('✅ SUCCESS with ' + modelId + '!');
      console.log('Response:', responseBody.completion || responseBody.content?.[0]?.text);
      break;
      
    } catch (error) {
      console.log('❌ Failed: ' + error.message);
    }
  }
}

testAllClaude();
