# AWS Bedrock Claude 4 MCP Server for Xcode Copilot

Integrate Claude 4 models via AWS Bedrock with Xcode Copilot using Model Context Protocol.

## Quick Setup

### 1. Project Setup
```bash
mkdir bedrock-mcp-server
cd bedrock-mcp-server
npm init -y
```

### 2. Install Dependencies
```bash
npm install @modelcontextprotocol/sdk @aws-sdk/client-bedrock-runtime dotenv
npm install -D typescript @types/node
```

### 3. Create TypeScript Config
`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "outDir": "./dist"
  },
  "include": ["*.ts"]
}
```

### 4. Environment Configuration
`.env`:
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

### 5. Copy the Server Code
Save the provided code as `index.ts` in your project root.

### 6. Build & Package Scripts
Update `package.json`:
```json
{
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "npx ts-node --esm index.ts"
  }
}
```

### 7. Build Project
```bash
npm run build
```

### 8. AWS Bedrock Model Access
1. Open [AWS Bedrock Console](https://console.aws.amazon.com/bedrock/)
2. Go to "Model access" → "Manage model access"
3. Enable these models:
   - `anthropic.claude-opus-4-1-20250805-v1:0` (Claude 4.1 - Recommended)
   - `anthropic.claude-sonnet-4-20250514-v1:0` (Claude 4 Sonnet)
   - `anthropic.claude-3-5-sonnet-20241022-v2:0` (Claude 3.5)

### 9. Configure in Xcode Copilot GUI

1. **Open Xcode Copilot Settings:**
   - In Xcode, go to `Window` → `Extensions` → `Copilot`
   - Or press `Cmd + Shift + P` → Search "Copilot Settings"

2. **Add MCP Server:**
   - Navigate to **Settings** tab
   - Click **MCP Servers** section
   - Click **Add Server** button

3. **Server Configuration:**
   ```
   Server Name: bedrock-claude
   Command: node
   Arguments: /full/path/to/your/project/dist/index.js
   Working Directory: /full/path/to/your/project
   ```

4. **Environment Variables:**
   Click **Add Environment Variable** and add:
   ```
   AWS_REGION = us-east-1
   AWS_ACCESS_KEY_ID = your_access_key
   AWS_SECRET_ACCESS_KEY = your_secret_key
   ```

5. **Save & Restart:**
   - Click **Save Configuration**
   - Restart Xcode Copilot: `Cmd + Shift + P` → "Copilot: Reload"

### 10. Test Server
```bash
# Test the server manually
node dist/index.js

# Should output: "Bedrock MCP server running with Converse API for Claude 4 support"
```

## Usage in Copilot

Once integrated, use the `invoke_claude` tool:

```
@invoke_claude Write a function to sort an array
```

With parameters:
```
@invoke_claude {
  "prompt": "Explain quantum computing", 
  "model": "anthropic.claude-opus-4-1-20250805-v1:0",
  "max_tokens": 2000,
  "temperature": 0.8
}
```

## Available Models
- 🥇 `anthropic.claude-opus-4-1-20250805-v1:0` - Claude Opus 4.1 (Latest & Best)
- 🥈 `anthropic.claude-sonnet-4-20250514-v1:0` - Claude Sonnet 4 
- 🥉 `anthropic.claude-opus-4-20250514-v1:0` - Claude Opus 4
- ⚡ `anthropic.claude-3-5-sonnet-20241022-v2:0` - Claude 3.5 Sonnet v2

## Troubleshooting

**Server Not Found in Copilot:**
- Verify absolute paths in server configuration
- Check `dist/index.js` exists after building
- Restart Copilot after configuration changes

**Model Access Denied:**
```bash
# Check AWS credentials
aws bedrock list-foundation-models --region us-east-1
```

**Check Server Status:**
- In Copilot Settings → MCP Servers tab
- Server should show "Connected" status
- View logs in the server details panel

**Logs Location:**
- Copilot GUI: Settings → MCP Servers → Your Server → View Logs
- File logs: `/tmp/mcp-bedrock.log`

## Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `AWS_REGION` | AWS region | `us-east-1` |
| `AWS_ACCESS_KEY_ID` | AWS access key | Required |
| `AWS_SECRET_ACCESS_KEY` | AWS secret | Required |
