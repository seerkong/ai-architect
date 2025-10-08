const fs = require('fs');
const path = require('path');

/**
 * 递归复制目录
 * @param {string} src 源目录
 * @param {string} dest 目标目录
 */
function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`Source directory ${src} does not exist, skipping...`);
    return;
  }

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied: ${srcPath} -> ${destPath}`);
    }
  }
}

/**
 * 清空目录
 * @param {string} dir 目录路径
 */
function cleanDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  fs.mkdirSync(dir, { recursive: true });
}

/**
 * 合并static和dist目录到public目录
 */
function mergeAssets() {
  const rootDir = path.dirname(__dirname);
  const staticDir = path.join(rootDir, 'static');
  const distDir = path.join(rootDir, 'client/dist');
  const publicDir = path.join(rootDir, 'public');

  console.log('Starting asset merge process...');
  console.log(`Static directory: ${staticDir}`);
  console.log(`Dist directory: ${distDir}`);
  console.log(`Public directory: ${publicDir}`);

  // 清空public目录
  console.log('Cleaning public directory...');
  cleanDir(publicDir);

  // 复制static目录内容到public目录
  console.log('Copying static assets...');
  copyDir(staticDir, publicDir);

  // 复制dist目录内容到public目录
  console.log('Copying dist assets...');
  copyDir(distDir, publicDir);

  console.log('Asset merge completed successfully!');
}

// 如果直接运行此脚本
if (require.main === module) {
  mergeAssets();
}

module.exports = { mergeAssets, copyDir, cleanDir };
