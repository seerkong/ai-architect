// 使用 Node.js 20+ 内置的 fetch API

export interface HttpRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: { [key: string]: string };
  body?: string;
  timeout?: number;
}

export interface PostJsonOptions {
  url: string;
  data?: any;
  headers?: { [key: string]: string };
  timeout?: number;
}

export interface GetImageBase64Options {
  url: string;
  headers?: { [key: string]: string };
  timeout?: number;
}

/**
 * 通用的HTTP请求方法，支持超时控制
 * @param url 请求URL
 * @param options 请求选项
 * @returns Promise<any> 响应数据
 */
export async function httpRequest(url: string, options: HttpRequestOptions = {}): Promise<any> {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = 10000
  } = options;

  return new Promise(async (resolve, reject) => {
    // 设置超时定时器
    const timeoutId = setTimeout(() => {
      reject(new Error(`HTTP请求超时 (${timeout / 1000}秒): ${method} ${url}`));
    }, timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, url: ${url}`);
      }

      // 检查响应内容类型
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.startsWith('application/json')) {
        const data = await response.json();
        resolve(data);
      } else {
        // 非JSON响应，返回原始响应对象
        resolve(response);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`HTTP请求失败: ${method} ${url}`, error);
      reject(error);
    }
  });
}

/**
 * 发送JSON POST请求
 * @param options 请求选项
 * @returns Promise<any> 响应数据
 */
export async function postJson(options: PostJsonOptions): Promise<any> {
  const {
    url,
    data = {},
    headers = {},
    timeout = 10000
  } = options;

  const body = JSON.stringify(data);
  
  return await httpRequest(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body,
    timeout
  });
}

/**
 * 获取图片并转换为Base64格式
 * @param options 请求选项
 * @returns Promise<string> Base64格式的图片数据
 */
export async function getImageBase64(options: GetImageBase64Options): Promise<string> {
  const {
    url,
    headers = {},
    timeout = 10000
  } = options;

  return new Promise(async (resolve, reject) => {
    // 设置超时定时器
    const timeoutId = setTimeout(() => {
      reject(new Error(`图片下载超时 (${timeout / 1000}秒): ${url}`));
    }, timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, url: ${url}`);
      }

      // 检查响应内容类型
      const contentType = response.headers.get('content-type');
      console.log(`Image API response content-type: ${contentType}`);

      if (contentType && contentType.startsWith('image/')) {
        // 如果是图片数据，转换为base64
        const arrayBuffer = await response.arrayBuffer();
        const imageBuffer = Buffer.from(arrayBuffer);
        const base64Data = imageBuffer.toString('base64');

        // 根据content-type确定MIME类型
        const mimeType = contentType.split(';')[0]; // 去掉可能的charset等参数
        resolve(`data:${mimeType};base64,${base64Data}`);
      } else {
        // 如果不是图片，尝试解析为JSON
        const data = await response.json() as any;
        resolve(data?.result || data);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`图片下载失败: ${url}`, error);
      reject(error);
    }
  });
}
