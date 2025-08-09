const { spawn } = require('child_process');

console.log('Testing MCP server connection...');

// Start your MCP server
const server = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'inherit'],
  cwd: process.cwd()
});

// Send initialize request
const initRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {
      roots: {
        listChanged: true
      }
    },
    clientInfo: {
      name: 'test-client',
      version: '1.0.0'
    }
  }
};

console.log('Sending initialize request...');
server.stdin.write(JSON.stringify(initRequest) + '\n');

// Send list tools request after a short delay
setTimeout(() => {
  const listToolsRequest = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list',
    params: {}
  };
  
  console.log('Sending list tools request...');
  server.stdin.write(JSON.stringify(listToolsRequest) + '\n');
}, 1000);

server.stdout.on('data', (data) => {
  console.log('✅ Server responded:', data.toString());
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
});

// Clean exit after 5 seconds
setTimeout(() => {
  console.log('Test complete, shutting down...');
  server.kill();
  process.exit(0);
}, 5000);
