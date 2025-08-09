require('dotenv').config();
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const client = new BedrockRuntimeClient({
  region: 'us-east-1',
});

async function testModels() {
  // List of Claude models to try
  const modelsToTry = [
    'anthropic.claude-3-haiku-20240307-v1:0',
    'anthropic.claude-3-sonnet-20240229-v1:0', 
    'anthropic.claude-v2:1',
    'anthropic.claude-instant-v1'
  ];

  for (const modelId of modelsToTry) {
    try {
      console.log('\n🧪 Testing ' + modelId + '...');
      
      let body;
      if (modelId.includes('claude-3')) {
        // Claude 3 format
        body = JSON.stringify({
          anthropic_version: "bedrock-2023-05-31",
          max_tokens: 100,
          messages: [
            {
              role: "user",
              content: "Hello! Please respond with 'Connection successful!'"
            }
          ]
        });
      } else {
        // Claude v2/Instant format
        body = JSON.stringify({
          prompt: "\n\nHuman: Hello! Please respond with 'Connection successful!'\n\nAssistant:",
          max_tokens_to_sample: 100,
          temperature: 0.1,
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
      console.log('Response:', responseBody.content?.[0]?.text || responseBody.completion);
      
      console.log('\n🎉 WORKING MODEL: ' + modelId);
      break;
      
    } catch (error) {
      console.log('❌ Failed with ' + modelId + ': ' + error.message);
    }
  }
}

testModels();
