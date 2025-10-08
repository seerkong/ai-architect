
import fs from 'fs';
import path from 'path';
// 使用 Node.js 20+ 内置的 fetch API
import { v4 as uuidv4 } from 'uuid';
import { getDocsImageBase64WithToken, getAccessTokenPublic } from './DocsApiHelper';

export async function saveDocImageUrl(docId: string, imageUrl: string, cookie?: string): Promise<string> {
  return await saveDocImageUrlByApi(docId, imageUrl);
  // return await saveWebpDocImageUrl(imageUrl, cookie);
}

// 新增支持传入token的版本
export async function saveDocImageUrlWithToken(docId: string, imageUrl: string, accessToken: string, cookie?: string): Promise<string> {
  return await saveDocImageUrlByApiWithToken(docId, imageUrl, accessToken);
}

// 将获取到的image base64内容，下载到这个项目根目录的 res/images 文件夹。如果目录不存在则创建
// 返回保存的图片的相对路径
export async function saveDocImageUrlByApi(docId: string, imageUrl: string): Promise<string> {
  try {
    // 提取出imageUrl中的id
    // 链接示例：https://example.com/image/load?id=-6480011882094676711fcAAgkOeWgOLwTJuDanOzy_88
    const imageId = imageUrl.split('?id=')[1];
    if (!imageId) {
      throw new Error(`无法从图片URL中提取imageId: ${imageUrl}`);
    }

    // 获取access token
    const accessToken = await getAccessTokenPublic();
    
    // 获取图片的base64内容
    const imageBase64 = await getDocsImageBase64WithToken(docId, imageId, accessToken) as string;
    if (!imageBase64) {
      throw new Error(`无法获取图片base64内容: docId=${docId}, imageId=${imageId}`);
    }

    // 确保 res/images 目录存在
    const imagesDir = path.join(process.cwd(), 'res', 'images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    // 解析base64内容，提取图片格式
    // base64格式通常是：data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
    let fileExtension = '.png'; // 默认扩展名
    let base64Data = imageBase64;

    if (imageBase64.startsWith('data:')) {
      // 提取MIME类型
      const mimeMatch = imageBase64.match(/data:image\/([^;]+);base64,(.+)/);
      if (mimeMatch) {
        const mimeType = mimeMatch[1];
        base64Data = mimeMatch[2];

        // 根据MIME类型确定文件扩展名
        switch (mimeType.toLowerCase()) {
          case 'jpeg':
          case 'jpg':
            fileExtension = '.jpg';
            break;
          case 'png':
            fileExtension = '.png';
            break;
          case 'gif':
            fileExtension = '.gif';
            break;
          case 'webp':
            fileExtension = '.webp';
            break;
          case 'svg+xml':
            fileExtension = '.svg';
            break;
          default:
            fileExtension = '.png';
            break;
        }
      }
    }

    // 生成唯一的文件名
    const fileName = `${uuidv4()}${fileExtension}`;
    const imagePath = path.join(imagesDir, fileName);

    // 将base64内容转换为Buffer并保存到文件
    const imageBuffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(imagePath, imageBuffer);

    // 返回相对路径
    return path.relative(process.cwd(), imagePath);
  } catch (error) {
    console.error('Error saving doc image by API:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to save image from API: ${errorMessage}`);
  }
}

// 支持传入token的版本
export async function saveDocImageUrlByApiWithToken(docId: string, imageUrl: string, accessToken: string): Promise<string> {
  try {
    // 提取出imageUrl中的id
    // 链接示例：https://example.com/image/load?id=-6480011882094676711fcAAgkOeWgOLwTJuDanOzy_88
    const imageId = imageUrl.split('?id=')[1];
    if (!imageId) {
      throw new Error(`无法从图片URL中提取imageId: ${imageUrl}`);
    }

    // 获取图片的base64内容
    const imageBase64 = await getDocsImageBase64WithToken(docId, imageId, accessToken) as string;
    if (!imageBase64) {
      throw new Error(`无法获取图片base64内容: docId=${docId}, imageId=${imageId}`);
    }

    // 确保 res/images 目录存在
    const imagesDir = path.join(process.cwd(), 'res', 'images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    // 解析base64内容，提取图片格式
    // base64格式通常是：data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
    let fileExtension = '.png'; // 默认扩展名
    let base64Data = imageBase64;

    if (imageBase64.startsWith('data:')) {
      // 提取MIME类型
      const mimeMatch = imageBase64.match(/data:image\/([^;]+);base64,(.+)/);
      if (mimeMatch) {
        const mimeType = mimeMatch[1];
        base64Data = mimeMatch[2];

        // 根据MIME类型确定文件扩展名
        switch (mimeType.toLowerCase()) {
          case 'jpeg':
          case 'jpg':
            fileExtension = '.jpg';
            break;
          case 'png':
            fileExtension = '.png';
            break;
          case 'gif':
            fileExtension = '.gif';
            break;
          case 'webp':
            fileExtension = '.webp';
            break;
          case 'svg+xml':
            fileExtension = '.svg';
            break;
          default:
            fileExtension = '.png';
            break;
        }
      }
    }

    // 生成唯一的文件名
    const fileName = `${uuidv4()}${fileExtension}`;
    const imagePath = path.join(imagesDir, fileName);

    // 将base64内容转换为Buffer并保存到文件
    const imageBuffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(imagePath, imageBuffer);

    // 返回相对路径
    return path.relative(process.cwd(), imagePath);
  } catch (error) {
    console.error('Error saving doc image by API with token:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to save image from API: ${errorMessage}`);
  }
}

// 将webp的图片网页链接，下载到这个项目根目录的 res/images 文件夹。如果目录不存在则创建
// 返回保存的图片的相对路径
export async function saveWebpDocImageUrl(imageUrl: string, cookie?: string): Promise<string> {
  try {
    // 确保 res/images 目录存在
    const imagesDir = path.join(process.cwd(), 'res', 'images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    // 从 URL 下载图片
    const headers: any = {};
    if (cookie) {
      // 清理 cookie 字符串：移除换行符、多余空格，并确保格式正确
      const cleanCookie = cookie
        .replace(/\r\n/g, ' ')  // 替换 Windows 换行符
        .replace(/\n/g, ' ')    // 替换 Unix 换行符
        .replace(/\r/g, ' ')    // 替换 Mac 换行符
        .replace(/\s+/g, ' ')   // 将多个连续空格替换为单个空格
        .trim();                // 移除首尾空格

      headers['Cookie'] = cleanCookie;
    }

    const response = await fetch(imageUrl, { headers });
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    // 生成唯一的文件名
    const fileExtension = path.extname(new URL(imageUrl).pathname) || '.webp';
    const fileName = `${uuidv4()}${fileExtension}`;
    const imagePath = path.join(imagesDir, fileName);

    // 保存图片到文件
    fs.writeFileSync(imagePath, imageBuffer);

    // 返回相对路径
    return path.relative(process.cwd(), imagePath);
  } catch (error) {
    console.error('Error saving webp image:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to save image from URL: ${errorMessage}`);
  }
}