#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('👀 Watching shared module for changes...');

// 初始构建
console.log('🔨 Initial build of shared module...');
try {
  execSync('npx tsc --build --watch', {
    cwd: path.join(__dirname, '../shared'),
    stdio: 'inherit'
  });
} catch (error) {
  console.error('❌ Failed to build shared module:', error.message);
  process.exit(1);
}
