import MarkdownIt from 'markdown-it';
import { postJson, getImageBase64 } from './HttpApiHelper';
import { configManager } from '../config';

const Endpoint_GetToken = "/token/refresh";
const Endpoint_GetDocsContent = "/api/get-markdown";
const Endpoint_GetImageStream = "/api/get-image";

export function getDocIdByLink(docsLink: string): string {
  let docId: string;
  // 根据链接格式提取 docId
  const match = docsLink.match(/\/.*\/([^?#]+)/);
    if (!match || !match[1]) {
      throw new Error(`无法从链接中提取 docId: ${docsLink}`);
    }
    docId = match[1];
  return docId;
}

// 根据文档链接提取文档id，再调用api获取文档内容
export async function getDocsContentByLink(docsLink: string) {
  try {
    let docId: string = getDocIdByLink(docsLink);

    console.log(`从链接提取的 docId: ${docId}`);

    // 调用现有的 getDocsContent 方法
    const accessToken = await getAccessTokenPublic();
    return await getDocsContentWithToken(docId, accessToken);
  } catch (error) {
    console.error("Error getting docs content by link:", error);
    throw error;
  }
}

export async function getDocsContentWithToken(docsId: string, accessToken: string) {
  const docsContent = await getDocs(accessToken, docsId);
  return docsContent;
}

export async function getDocsImageBase64WithToken(docsId: string, imageId: string, accessToken: string) {
  const imageBase64 = await callDocsImageBase64Api(accessToken, docsId, imageId);
  return imageBase64;
}

// 新增获取token的公共接口
export async function getAccessTokenPublic() {
  return await getAccessToken() as string;
}


async function getAccessToken() {
  try {
    const docsApiConfig = configManager.getDocsApiConfig();
    
    const data = await postJson({
      url: `${docsApiConfig.base_url}${Endpoint_GetToken}`,
      data: {
        appKey: docsApiConfig.app_key,
        secretKey: docsApiConfig.secret_key,
        grantType: "client_credentials",
      },
      timeout: 10000
    });

    return data?.result?.accessToken;
  } catch (error) {
    console.error("Error getting access token:", error);
    throw error;
  }
}


async function callDocsImageBase64Api(accessToken: string, docsId: string, imageId: string) {
  try {
    const docsApiConfig = configManager.getDocsApiConfig();
    
    const base64Data = await getImageBase64({
      url: `${docsApiConfig.base_url}${Endpoint_GetImageStream}?docId=${docsId}&imageId=${imageId}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      timeout: 10000
    });

    return base64Data;
  } catch (error) {
    console.error(`Error getting image base64: docId=${docsId}, imageId=${imageId}`, error);
    throw error;
  }
}

async function getDocs(accessToken: string, docsId: string) {
  try {
    const docsApiConfig = configManager.getDocsApiConfig();
    
    const data = await postJson({
      url: `${docsApiConfig.base_url}${Endpoint_GetDocsContent}?docId=${docsId}`,
      data: {},
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      timeout: 10000
    });

    return data?.result;
  } catch (error) {
    console.error("Error getting docs content:", error);
    throw error;
  }
}

// 创建markdown-it实例，配置常用选项
const md = new MarkdownIt({
  html: true,        // 允许HTML标签
  breaks: true,      // 将换行符转换为<br>
  linkify: true,     // 自动将URL转换为链接
});

/**
 * 将Markdown内容转换为HTML片段
 * @param markdownContent - Markdown文本内容
 * @returns HTML字符串
 */
export function convertMarkdownToHtml(markdownContent: string): string {
  if (!markdownContent || typeof markdownContent !== 'string') {
    return '';
  }

  try {
    // 使用markdown-it库将markdown转换为HTML
    const htmlContent = md.render(markdownContent);
    return htmlContent;
  } catch (error) {
    console.error('Error converting markdown to HTML:', error);
    // 如果转换失败，返回原始内容（可以作为纯文本显示）
    return markdownContent;
  }
}

export interface MarkImgSlotText {
  markSlotText: string;
  slotKeyToImgUrl: { [key: string]: string };
}

// 将一段文本中，包含特定特征的【所有链接】，提取出来，并将每个链接原地替换为一个槽位
// 链接的特征是url中包含 /image/load?id=
// 链接后面的id中，有时会出现中横线，需要将中横线改为两个下划线
// 示例
// 前前前![图片](https://example.com/image/load?id=-5277984-tttt)后后后
// 替换后，文本变为如下形式，并存放到markSlotText 中
// 前前前${img__5277984__tttt}后后后
// 同时将文本中的所有slotKey和url保存到一个map中
// slotKeyToImgUrl = {
//   "img__5277984__tttt": 
// "https://example.com/image/load?id=-5277984-tttt"
// }
export function extractImgUrlAndMarkSlots(textContent: string): MarkImgSlotText {
  if (!textContent || typeof textContent !== 'string') {
    return {
      markSlotText: '',
      slotKeyToImgUrl: {}
    };
  }

  const slotKeyToImgUrl: { [key: string]: string } = {};
  let markSlotText = textContent;

  // 正则表达式匹配图片链接
  // 匹配格式：![任意alt text](https://example.com/image/load?id=xxxxx)
  const imgUrlRegex = /!\[([^\]]*)\]\((https:\/\/example\.com\/image\/load\?id=([^)]+))\)/g;

  let match;
  while ((match = imgUrlRegex.exec(textContent)) !== null) {
    const altText = match[1]; // alt text
    const fullUrl = match[2]; // 完整的图片URL
    const imageId = match[3]; // 图片ID部分

    // 将图片ID中的中横线替换为双下划线，生成槽位键
    const slotKey = `img__${imageId.replace(/-/g, '__')}`;

    // 将完整URL存储到映射中
    slotKeyToImgUrl[slotKey] = fullUrl;

    // 将原始图片链接替换为槽位标记
    markSlotText = markSlotText.replace(fullUrl, `\${${slotKey}}`);
  }

  return {
    markSlotText,
    slotKeyToImgUrl
  };
}

// 将markImgSlotText中的slotKey替换为slotKeyToImgReplaceText中的文本
// 示例
// markImgSlotText = {
//   markSlotText: "前前前${img__5277984__tttt}后后后",
//   slotKeyToImgUrl: {
//     "img__5277984__tttt": "https://example.com/image/load?id=-5277984-tttt"
//   }
// }
// slotKeyToImgReplaceText = {
//   "img__5277984__tttt": "图片解析后的内容"
// }
// 替换后，文本变为如下形式
// 前前前图片解析后的内容后后后
export function replaceImgSlotsWithText(
  markImgSlotText: MarkImgSlotText,
  slotKeyToImgReplaceText: { [key: string]: string }
): string {
  if (!markImgSlotText || !markImgSlotText.markSlotText) {
    return '';
  }

  let resultText = markImgSlotText.markSlotText;

  // 遍历所有槽位键，将 ${slotKey} 替换为对应的图片解析内容
  for (const slotKey in slotKeyToImgReplaceText) {
    if (slotKeyToImgReplaceText.hasOwnProperty(slotKey)) {
      const replaceText = slotKeyToImgReplaceText[slotKey];
      const slotPattern = `\\$\\{${slotKey}\\}`;
      const regex = new RegExp(slotPattern, 'g');
      resultText = resultText.replace(regex, replaceText);
    }
  }

  return resultText;
}