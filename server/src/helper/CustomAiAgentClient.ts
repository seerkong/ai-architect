// 使用 Node.js 20+ 内置的 fetch API
import { ChatCompletionCreateParams } from "openai/resources/chat";

export interface AgentClientCallback {
  onMessage?: (msg: string) => void;
  onDone?: () => void;
}

export interface AiClientOptions {
  stream: boolean;
  claudeCompatible?: boolean;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  timeoutMs?: number; // 单位毫秒
}

export interface OpenAiChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OpenAiChatRequest {
  model: string;
  messages: OpenAiChatMessage[];
}

// Claude 格式的消息接口
export interface ClaudeCompatibleMessage {
  role: 'user' | 'assistant' | 'system';
  content: Array<{
    type: 'text';
    text: string;
  }>;
}


interface NonStreamChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface ChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      content?: string;
    };
    finish_reason?: string;
  }>;
}

function openAiMessagesToClaudeMessages(
  messages: OpenAiChatMessage[]
): ClaudeCompatibleMessage[] {
  // 转换消息格式为 Claude 格式
  const claudeMessages: ClaudeCompatibleMessage[] = messages
    .map((msg, index) => {
      // console.log(`消息 ${index}:`, JSON.stringify(msg, null, 2));

      const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);

      // 检查内容是否为空或只包含空白字符
      if (!content || content.trim() === '') {
        console.warn(`⚠️ 消息 ${index} 内容为空或只包含空白字符，跳过此消息`);
        return null;
      }

      return {
        role: msg.role as 'user' | 'assistant' | 'system',
        content: [{
          type: 'text',
          text: content.trim()
        }]
      };
    })
    .filter(msg => msg !== null) as ClaudeCompatibleMessage[];
  return claudeMessages;
}


export function makeCustomAIClient({ baseURL, apiKey }: { baseURL: string, apiKey: string }) {
  return {
    baseURL: baseURL,
    apiKey: apiKey,
  };
}

export async function callCustomAI(callback: AgentClientCallback, client: any, apiParam: ChatCompletionCreateParams, options: AiClientOptions) {
  // 添加超时控制
  const timeoutMs = options.timeoutMs || 120000; // 默认超时

  return new Promise(async (resolve, reject) => {
    // 设置超时定时器
    const timeoutId = setTimeout(() => {
      reject(new Error(`AI调用超时 (${timeoutMs / 1000}秒)`));
    }, timeoutMs);

    try {
      // console.log("------client:\n", JSON.stringify(client, null, 2));

      const url = `${client.baseURL}/chat/completions`;

      // 过滤空消息内容
      const filteredMessages = apiParam.messages
        .map((msg, index) => {
          const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);

          // 检查内容是否为空或只包含空白字符
          if (!content || content.trim() === '') {
            console.warn(`⚠️ 消息 ${index} 内容为空或只包含空白字符，跳过此消息`);
            return null;
          }

          return {
            ...msg,
            content: content.trim()
          };
        })
        .filter(msg => msg !== null) as OpenAiChatMessage[];

      // 确保至少有一个消息
      if (filteredMessages.length === 0) {
        throw new Error('没有有效的消息内容');
      }

      console.log(`✅ 过滤后有效消息数量: ${filteredMessages.length}`);
      let messages: any[] = filteredMessages;
      if (options.claudeCompatible) {
        messages = openAiMessagesToClaudeMessages(filteredMessages);
      }
      let requestBody = {
        model: apiParam.model,
        messages: messages,
        stream: options.stream || false,
        max_tokens: options.max_tokens || undefined,
        temperature: options.temperature || undefined,
        top_p: options.top_p || undefined,
      };

      const headers = {
        'Authorization': `Bearer ${client.apiKey}`,
        'Content-Type': 'application/json',
      };
      let stream = options.stream;

      let result = {
        role: 'assistant',
        content: '',
        tool_calls: [] as Array<{
          id: string;
          type: string;
          function: {
            name: string;
            arguments: string;
          };
        }>,
      };

      console.log(`🚀 开始发送${stream ? '流式' : '非流式'}请求...`);
      // console.log('📝 请求内容:', JSON.stringify(requestBody, null, 2));
      console.log('🔗 请求URL:', url);
      // console.log('📋 请求头:', JSON.stringify(headers, null, 2));
      console.log('─'.repeat(50));

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        console.error(`❌ HTTP错误! 状态码: ${response.status}`);
        console.error(`❌ 状态文本: ${response.statusText}`);

        // 尝试获取错误响应内容
        try {
          const errorText = await response.text();
          console.error('❌ 错误响应内容:');
          console.error(errorText);
        } catch (e) {
          console.error('❌ 无法读取错误响应内容:', e);
        }

        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (stream) {
        // 流式处理
        if (!response.body) {
          throw new Error('Response body is null');
        }

        console.log('✅ 连接成功，开始接收流式数据...\n');

        let buffer = '';
        let fullResponse = '';

        // 使用 Web Streams API 处理流式响应
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              console.log('\n✅ 流式响应处理完成');
              if (callback && callback.onDone) {
                callback.onDone();
              }
              break;
            }

            // 解码数据块
            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;

            // 按行分割数据
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // 保留最后一个不完整的行

            for (const line of lines) {
              const trimmedLine = line.trim();

              // 跳过空行和注释行
              if (!trimmedLine || trimmedLine.startsWith(':')) {
                continue;
              }

              // 处理 data: 开头的行
              if (trimmedLine.startsWith('data: ')) {
                const data = trimmedLine.slice(6); // 移除 'data: ' 前缀

                // 检查是否是结束标记
                if (data === '[DONE]') {
                  console.log('\n🏁 流式响应结束');
                  // console.log('📄 完整响应内容:', fullResponse);
                  break;
                }

                try {
                  const parsed: ChatResponse = JSON.parse(data);

                  // 提取内容
                  if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta.content) {
                    const content = parsed.choices[0].delta.content;
                    fullResponse += content;
                    process.stdout.write(content); // 实时输出内容

                    if (callback && callback.onMessage) {
                      callback.onMessage(content);
                    }
                  }
                } catch (error) {
                  console.error('❌ 解析JSON失败:', error);
                  console.error('原始数据:', data);
                }
              }
            }
          }
        } catch (error) {
          console.error('❌ 流式响应错误:', error);
          throw error;
        } finally {
          reader.releaseLock();
        }

        result.content = fullResponse;

      } else {
        // 非流式处理
        console.log('✅ 连接成功，等待完整响应...\n');

        const responseText = await response.text();
        // console.log('📄 原始响应内容:');
        // console.log(responseText);
        // console.log('\n' + '─'.repeat(50));

        try {
          const parsed: NonStreamChatResponse = JSON.parse(responseText);
          // console.log('📋 解析后的响应:');
          // console.log(JSON.stringify(parsed, null, 2));

          if (parsed.choices && parsed.choices[0] && parsed.choices[0].message) {
            // console.log('\n💬 AI回复内容:');
            // console.log(parsed.choices[0].message.content);
            result = (parsed as any).choices[0]!.message;
          }

          if (parsed.usage) {
            console.log('\n📊 Token使用情况:');
            console.log(`- 提示词Token: ${parsed.usage.prompt_tokens}`);
            console.log(`- 完成Token: ${parsed.usage.completion_tokens}`);
            console.log(`- 总计Token: ${parsed.usage.total_tokens}`);
          }

        } catch (error) {
          console.error('❌ 解析JSON失败:', error);
          console.error('原始响应:', responseText);
        }
      }

      clearTimeout(timeoutId);
      resolve(result);
    } catch (error) {
      clearTimeout(timeoutId);
      reject(error);
    }
  });
}