import * as fs from 'fs';
import * as path from 'path';

// 改进的文件读取函数，支持开发和生产环境
export function readPromptFile(fileName: string): string {
  try {
    // 方法1: 使用 __dirname (CommonJS 方式) - 开发环境
    const currentDir = __dirname;
    // 从 common 目录回到 aiagent 目录，然后进入 prompt 目录
    const aiagentDir = path.dirname(currentDir);
    let filePath = path.join(aiagentDir, 'prompt', fileName);

    console.log("尝试读取开发环境文件路径: ", filePath);

    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf-8');
    }
  } catch (error) {
    console.warn("使用 __dirname 方式读取文件失败:", error);
  }

  try {
    // 方法1.1: 使用 __filename 定位 - 更准确的路径计算
    const currentFile = __filename;
    const srcDir = path.dirname(path.dirname(path.dirname(currentFile))); // 回到 src 目录
    const promptDir = path.join(srcDir, 'aiagent', 'prompt');
    let filePath = path.join(promptDir, fileName);

    console.log("尝试读取 __filename 定位路径: ", filePath);

    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf-8');
    }
  } catch (error) {
    console.warn("使用 __filename 定位路径读取文件失败:", error);
  }

  try {
    // 方法1.5: 使用 process.cwd() 从项目根目录查找 - 调试环境
    const projectRoot = process.cwd();
    const promptDir = path.join(projectRoot, 'src', 'aiagent', 'prompt');
    let filePath = path.join(promptDir, fileName);

    console.log("尝试读取调试环境文件路径: ", filePath);

    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf-8');
    }
  } catch (error) {
    console.warn("使用调试环境路径读取文件失败:", error);
  }

  try {
    // 方法2: 构建后环境 - 从 dist 目录读取
    const currentDir = process.cwd();
    const promptDir = path.join(currentDir, 'dist', 'aiagent', 'prompt');
    let filePath = path.join(promptDir, fileName);

    console.log("尝试读取构建后文件路径: ", filePath);

    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf-8');
    }
  } catch (error) {
    console.warn("使用构建后路径读取文件失败:", error);
  }

  try {
    // 方法3: 使用项目根目录相对路径 (最后备选方案)
    const projectRoot = process.cwd();
    // 检查当前是否已经在 server 目录中
    const isInServerDir = projectRoot.endsWith('server');
    const promptDir = isInServerDir
      ? path.join(projectRoot, 'src', 'aiagent', 'prompt')
      : path.join(projectRoot, 'server', 'src', 'aiagent', 'prompt');
    const relativePath = path.join(promptDir, fileName);
    console.log("尝试读取项目根目录相对路径文件: ", relativePath);

    if (fs.existsSync(relativePath)) {
      return fs.readFileSync(relativePath, 'utf-8');
    }
  } catch (error) {
    console.warn("使用项目根目录相对路径读取文件失败:", error);
  }

  throw new Error(`无法找到文件: ${fileName}。请确保 prompt 文件夹存在且包含该文件。`);
}