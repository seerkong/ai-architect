import { TechDocAIAgentRuntime } from "../../contract/TechDocAIAgentRuntime";
import { AiWebArchitectMesh } from "../../../mesh/AiWebArchitectMesh";
import { TechDocAIAgentActorLogic } from "../TechDocAIAgentActorLogic";

/**
 * SSE消息数据接口
 */
export interface SSEMessage {
  event: string;
  content?: string;
  data?: any;
  conversationId?: string;
  messageId?: string;
  error?: string;
}

/**
 * SSE请求参数基类
 */
export interface BaseSSERequest {
  userCommand: string;
  projectKey: string;
}

/**
 * SSE处理器基类
 * 提供公共的SSE流处理逻辑
 */
export abstract class BaseSSEHandler {
  constructor(
    protected mesh: AiWebArchitectMesh,
    protected runtime: TechDocAIAgentRuntime,
    protected publicLogic: TechDocAIAgentActorLogic
  ) { }

  /**
   * 构建请求参数
   * 子类需要实现此方法来提供特定的请求参数
   */
  protected abstract buildRequestData(userCommand: string, projectKey: string): any;

  /**
   * 获取SSE端点URL
   * 子类需要实现此方法来提供特定的端点URL
   */
  protected abstract getSSEUrl(): string;

  /**
   * 处理特定的SSE消息
   * 子类可以重写此方法来处理特定的消息类型
   */
  protected handleSSEMessage(message: SSEMessage): void {
    if (message.event === 'done') {
      console.log('Stream completed');
      this.resetButtonStates();
      this.runtime.data.chatReader = null;
      return;
    }

    if (message.conversationId) {
      // 设置会话id
      const conversationIdInput = document.getElementById('conversation-id') as HTMLInputElement;
      conversationIdInput.value = message.conversationId;
    }

    if (message.event === 'result') {
      console.log('Stream result', message.data);
      this.handleResultMessage(message);
    } else if (message.event === 'message') {
      if (message.content) {
        // 使用富文本编辑器追加内容
        const chatEditor = this.runtime.data.chatOutputEditor;
        if (chatEditor) {
          // 检查内容中是否包含换行符
          if (message.content.includes('\n')) {
            // 有换行符，按行处理
            const lines = message.content.split('\n');
            for (let i = 0; i < lines.length; i++) {
              if (i > 0) {
                // 在非首行之前插入硬换行
                chatEditor.appendHardBreak();
              }
              if (lines[i]) {
                // 追加文本（不创建新段落）
                chatEditor.appendText(lines[i]);
              }
            }
          } else {
            // 无换行符，直接追加文本
            chatEditor.appendText(message.content);
          }
        }
      }
    }

    if (message.error) {
      const chatEditor = this.runtime.data.chatOutputEditor;
      if (chatEditor) {
        const errorHtml = `<p style="color: #dc3545; font-weight: bold;">[错误] ${message.error}</p>`;
        chatEditor.appendContent(errorHtml);
      }
      this.resetButtonStates();
      this.runtime.data.chatReader = null;
    }
  }


  /**
   * 处理result消息
   * 子类可以重写此方法来处理特定的result消息
   */
  protected handleResultMessage(message: SSEMessage): void {
    // 默认实现，子类可以重写
    console.log('处理result消息:', message.data);
  }

  /**
   * 重置按钮状态
   */
  private resetButtonStates(): void {
    const startBtn = document.getElementById('startChatBtn') as HTMLButtonElement;
    const stopBtn = document.getElementById('stopChatBtn') as HTMLButtonElement;
    startBtn.disabled = false;
    stopBtn.disabled = true;
  }

  /**
   * 设置按钮状态为运行中
   */
  private setRunningButtonStates(): void {
    const startBtn = document.getElementById('startChatBtn') as HTMLButtonElement;
    const stopBtn = document.getElementById('stopChatBtn') as HTMLButtonElement;
    startBtn.disabled = true;
    stopBtn.disabled = false;
  }

  /**
   * 清空聊天输出
   */
  private clearChatOutput(): void {
    const chatEditor = this.runtime.data.chatOutputEditor;
    if (chatEditor) {
      // 设置一个空段落，作为流式输出的起点
      chatEditor.setContent('<p></p>');
    }
  }

  /**
   * 启动SSE流
   */
  public async startSSE(): Promise<void> {
    const userCommand = (document.getElementById('chat-input') as HTMLInputElement).value.trim();
    const projectKeyNode = document.getElementById('project-key') as HTMLInputElement;
    const projectKey = projectKeyNode.value.trim();

    if (!projectKey) {
      alert('请输入项目key');
      return;
    }

    // 清空输出并设置按钮状态
    this.clearChatOutput();
    this.setRunningButtonStates();

    // 构建请求数据
    const postData = this.buildRequestData(userCommand, projectKey);
    const sseUrl = this.getSSEUrl();

    try {
      // 使用 fetch 发送 POST 请求到 SSE 接口
      const response = await fetch(sseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // 创建 ReadableStream 来处理流式响应
      this.runtime.data.chatReader = response.body?.getReader() || null;
      if (!this.runtime.data.chatReader) {
        throw new Error('No response body reader available');
      }

      this.processStream();

    } catch (error) {
      console.error('SSE Error:', error);
      const chatEditor = this.runtime.data.chatOutputEditor;
      if (chatEditor) {
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        const errorHtml = `<p style="color: #dc3545; font-weight: bold;">[错误] ${errorMessage}</p>`;
        chatEditor.appendContent(errorHtml);
      }
      this.resetButtonStates();
      this.runtime.data.chatReader = null;
    }
  }

  /**
   * 处理SSE流
   */
  private processStream(): void {
    const decoder = new TextDecoder();
    let buffer = ''; // 用于缓存不完整的数据

    const readStream = () => {
      // 检查chatReader是否还存在
      if (!this.runtime.data.chatReader) {
        console.log('Stream reader is null, stopping stream processing');
        return;
      }

      this.runtime.data.chatReader.read().then(({ done, value }) => {
        if (done) {
          console.log('Stream finished');
          this.resetButtonStates();
          this.runtime.data.chatReader = null;
          return;
        }

        // 解码数据并添加到缓冲区
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // 按行分割数据
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // 保留最后一个不完整的行

        for (const line of lines) {
          const trimmedLine = line.trim();

          // 跳过空行
          if (!trimmedLine) {
            continue;
          }

          if (trimmedLine.startsWith('data: ')) {
            const data = trimmedLine.slice(6); // 移除 'data: ' 前缀

            // 跳过结束标记
            if (data === '[DONE]') {
              continue;
            }

            try {
              const parsed: SSEMessage = JSON.parse(data);
              this.handleSSEMessage(parsed);
            } catch (e) {
              // 只有在数据看起来像JSON时才记录错误
              if (data.startsWith('{') || data.startsWith('[')) {
                console.log('Non-JSON data:', data);
              }
            }
          }
        }

        // 继续读取（只有在chatReader还存在时才继续）
        if (this.runtime.data.chatReader) {
          readStream();
        }
      }).catch((error) => {
        console.error('Stream read error:', error);
        this.resetButtonStates();
        this.runtime.data.chatReader = null;
      });
    };

    readStream();
  }

  /**
   * 停止SSE流
   */
  public stopSSE(): void {
    const chatReader = this.runtime.data.chatReader;
    // 停止流式响应
    if (chatReader) {
      chatReader.cancel();
      this.runtime.data.chatReader = null;
    }

    this.resetButtonStates();

    const chatEditor = this.runtime.data.chatOutputEditor;
    if (chatEditor) {
      const stopHtml = '<p style="color: #666; font-style: italic;">[已停止]</p>';
      chatEditor.appendContent(stopHtml);
    }
  }
}
