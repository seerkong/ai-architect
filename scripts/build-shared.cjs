#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🔨 Building shared module...');

try {
  // 构建 shared 模块
  execSync('npx tsc --build', {
    cwd: path.join(__dirname, '../shared'),
    stdio: 'inherit'
  });

  console.log('✅ Shared module built successfully!');
} catch (error) {
  console.error('❌ Failed to build shared module:', error.message);
  process.exit(1);
}
