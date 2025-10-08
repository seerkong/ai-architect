const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting browser development server...');

// 启动Vite开发服务器
const viteProcess = spawn('npx', ['vite'], {
  cwd: path.join(__dirname, '../browser'),
  stdio: 'inherit',
  shell: true
});

viteProcess.on('error', (error) => {
  console.error('❌ Failed to start Vite:', error);
  process.exit(1);
});

viteProcess.on('exit', (code) => {
  console.log(`📦 Vite process exited with code ${code}`);
  process.exit(code);
});

// 处理进程退出
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down browser development server...');
  viteProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down browser development server...');
  viteProcess.kill('SIGTERM');
});
