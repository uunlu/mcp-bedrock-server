require('dotenv').config();
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const client = new BedrockRuntimeClient({
  region: 'us-east-1',
});

async function testNewestClaude() {
  // Start with the newest/best models
  const profilesToTry = [
    'us.anthropic.claude-3-5-sonnet-20240620-v1:0',  // Claude 3.5 Sonnet (newest)
    'us.anthropic.claude-3-5-haiku-20241022-v1:0',   // Claude 3.5 Haiku (fastest)
    'us.anthropic.claude-3-opus-20240229-v1:0'       // Claude 3 Opus (most capable)
  ];

  for (const profileId of profilesToTry) {
    try {
      console.log('\n🧪 Testing: ' + profileId + '...');
      
      const body = JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 100,
        messages: [
          {
            role: "user",
            content: "Hello! Please respond with 'Connection successful!' and tell me which Claude model you are."
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
      
      console.log('✅ SUCCESS with: ' + profileId);
      console.log('Claude response:', responseBody.content[0].text);
      console.log('🎉 WORKING PROFILE: ' + profileId);
      
      return profileId; // Return the first working one
      
    } catch (error) {
      console.log('❌ Failed: ' + error.message);
    }
  }
}

testNewestClaude();
