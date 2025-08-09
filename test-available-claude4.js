require('dotenv').config();
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const client = new BedrockRuntimeClient({
  region: 'us-east-1',
});

async function testAvailableClaude4() {
  const modelsToTest = [
    {
      id: 'us.anthropic.claude-sonnet-4-20250514-v1:0',
      name: 'Claude Sonnet 4.0'
    },
    {
      id: 'us.anthropic.claude-opus-4-1-20250805-v1:0', 
      name: 'Claude Opus 4.1'
    }
  ];

  const workingModels = [];

  for (const model of modelsToTest) {
    try {
      console.log(`\n🧪 Testing ${model.name}: ${model.id}...`);
      
      const body = JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 150,
        messages: [
          {
            role: "user",
            content: `Hello! Please respond with 'Connection successful!' and tell me exactly which Claude model you are - specifically if you're Claude 4.0 Sonnet, Claude 4.1 Opus, or another variant. Also mention your key capabilities.`
          }
        ]
      });

      const command = new InvokeModelCommand({
        modelId: model.id,
        body: body,
        contentType: 'application/json',
        accept: 'application/json',
      });

      const response = await client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      console.log(`✅ SUCCESS with ${model.name}!`);
      console.log('Response:', responseBody.content[0].text);
      console.log(`🎉 CONFIRMED WORKING: ${model.id}`);
      
      workingModels.push(model);
      
    } catch (error) {
      console.log(`❌ Failed with ${model.name}: ${error.message}`);
    }
  }
  
  if (workingModels.length > 0) {
    console.log('\n🎯 SUMMARY - Your working Claude 4 models:');
    workingModels.forEach((model, index) => {
      console.log(`\${index + 1}. ${model.name}: ${model.id}`);
    });
  }
  
  return workingModels;
}

testAvailableClaude4();
