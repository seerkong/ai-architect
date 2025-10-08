import type {
  ChatCompletionCreateParams,
  ChatCompletionMessageParam
} from 'openai/resources/chat/completions';

import { AgentClientCallback, callCustomAI, makeCustomAIClient } from '../../helper/CustomAiAgentClient';
import fs from 'fs';
import { ArchitectAgentCallback } from '../architect/ArchitectAgentRuntime';
import { Logger } from '../../helper/logger';
import { readPromptFile } from '../helper/PromptHelper';
import { configManager } from '../../config';

export interface ImgRecognitionResult {
  content: string;
  xmlContent: string;
}

export interface ImgRecognitionAgentRuntime {
  callback: ArchitectAgentCallback;
  logger: Logger;
  cookie: string;
}

export class ImgRecognitionAgent {
  public static async recognizeImage(
    imagePath: string,
    callback?: AgentClientCallback,
    customSystemPrompt?: string
  ): Promise<ImgRecognitionResult> {

    // 读取图片文件并转换为 base64
    let base64Image: string;
    try {
      console.log(`正在读取图片文件: ${imagePath}`);
      const imageBuffer = fs.readFileSync(imagePath);
      const imageExtension = imagePath.split('.').pop()?.toLowerCase() || 'jpg';
      base64Image = `data:image/${imageExtension};base64,${imageBuffer.toString('base64')}`;
      console.log(`图片已转换为 base64，大小: ${Math.round(base64Image.length / 1024)}KB`);
    } catch (error) {
      throw new Error(`无法读取图片文件: ${error instanceof Error ? error.message : String(error)}`);
    }

    // 构建系统提示词
    const defaultSystemPrompt = readPromptFile('ImgRecognitionPrompt.md')

    // 使用自定义提示词或默认提示词
    const systemPrompt = customSystemPrompt && customSystemPrompt.trim()
      ? customSystemPrompt.trim()
      : defaultSystemPrompt;

    // 构建消息参数
    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: '请识别并分析这张图片的内容。'
          },
          {
            type: 'image_url',
            image_url: {
              url: base64Image
            }
          }
        ]
      }
    ];

    // 配置AI客户端
    const openaiConfig = configManager.getOpenaiConfig();
    const imageConfig = configManager.getImageRecognitionConfig();
    
    const clientConfig = {
      baseURL: openaiConfig.base_url,
      apiKey: imageConfig.api_key,
    };

    const aiClient = makeCustomAIClient(clientConfig);

    const apiParam: ChatCompletionCreateParams = {
      model: imageConfig.model,
      messages: messages,
    };

    try {
      console.log('开始调用AI进行图片识别...');
      console.log('API参数:', JSON.stringify({
        model: apiParam.model,
        messages: apiParam.messages.map(msg => ({
          role: msg.role,
          content: typeof msg.content === 'string' ? msg.content : 'multimodal content'
        }))
      }, null, 2));

      // 调用AI进行图片识别
      const message = await callCustomAI(
        callback || {},
        aiClient,
        apiParam,
        { stream: false }
      ) as any;

      const content = String(message?.content || '');
      console.log('AI响应:', content);

      // 解析AI返回的内容
      let recognitionResult: ImgRecognitionResult;

      try {
        // 尝试提取XML内容
        const xmlMatch = content.match(/<ImgRecognitionResult>[\s\S]*<\/ImgRecognitionResult>/);
        if (xmlMatch) {
          const xmlContent = xmlMatch[0];
          recognitionResult = {
            content: content,
            xmlContent: xmlContent
          };
        } else {
          // 如果没有找到XML格式，使用原始内容
          recognitionResult = {
            content: content,
            xmlContent: content
          };
        }
      } catch (parseError) {
        // 解析失败，使用原始内容
        recognitionResult = {
          content: content,
          xmlContent: content
        };
      }

      return recognitionResult;

    } catch (error) {
      console.error('图片识别失败:', error);
      throw new Error(`图片识别失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
