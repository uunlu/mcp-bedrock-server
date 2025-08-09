require('dotenv').config();
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const client = new BedrockRuntimeClient({
  region: 'us-east-1',
});

async function testClaude4() {
  // Test the Claude 4 inference profiles you might have
  const claude4ProfilesToTry = [
    'us.anthropic.claude-opus-4-20250514-v1:0',
    'us.anthropic.claude-sonnet-4-20250514-v1:0',
    'us.anthropic.claude-opus-4-1-20250805-v1:0'
  ];

  for (const profileId of claude4ProfilesToTry) {
    try {
      console.log('\n🧪 Testing Claude 4 profile: ' + profileId + '...');
      
      const body = JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 100,
        messages: [
          {
            role: "user",
            content: "Hello! Please respond with 'Connection successful!' and tell me which Claude model version you are."
          }
        ]
      });

      const command = new InvokeModelCommand({
        modelId: profileId,
        body: body,
        contentType: 'application/json',
        accept: 'application/json',
      });

      const response = await client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      console.log('✅ SUCCESS with Claude 4: ' + profileId);
      console.log('Claude 4 response:', responseBody.content[0].text);
      console.log('🎉 WORKING CLAUDE 4 PROFILE: ' + profileId);
      
      return profileId; // Return the first working Claude 4 model
      
    } catch (error) {
      console.log('❌ Failed: ' + error.message);
    }
  }
  
  console.log('\n❌ No Claude 4 models working. You might need to check what Claude 4 inference profiles you have access to.');
}

testClaude4();
