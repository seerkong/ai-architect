#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting production server...');

// 检查构建产物是否存在
const serverDistPath = path.join(__dirname, '../server/dist');
const publicPath = path.join(__dirname, '../public');

const fs = require('fs');
if (!fs.existsSync(serverDistPath)) {
  console.error('❌ Server build not found. Please run build first.');
  process.exit(1);
}

if (!fs.existsSync(publicPath)) {
  console.error('❌ Public directory not found. Please run build first.');
  process.exit(1);
}

// 启动生产服务器
const serverProcess = spawn('node', ['dist/index.js'], {
  cwd: path.join(__dirname, '../server'),
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production'
  }
});

serverProcess.on('error', (error) => {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
});

serverProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Server exited with code ${code}`);
    process.exit(code);
  }
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  serverProcess.kill('SIGTERM');
});
