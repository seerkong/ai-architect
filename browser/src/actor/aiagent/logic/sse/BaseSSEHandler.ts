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
 * XML标签解析状态
 */
interface XmlTagParseState {
  isInTag: boolean;
  tagType: 'MutationPartial' | 'HumanConfirmPartial' | 'think' | null;
  content: string;
  buffer: string; // 缓存未完成的标签文本
  nodePos: number; // 当前处理节点的位置
  tagStack: string[]; // 标签层级栈，用于跟踪嵌套层级
}

/**
 * SSE处理器基类
 * 提供公共的SSE流处理逻辑
 */
export abstract class BaseSSEHandler {
  // XML标签解析状态
  private xmlParseState: XmlTagParseState = {
    isInTag: false,
    tagType: null,
    content: '',
    buffer: '',
    nodePos: -1,
    tagStack: []
  };

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

      // 检查是否有未闭合的XML标签
      if (this.xmlParseState.isInTag) {
        console.warn(`[流结束但标签未闭合] 类型: ${this.xmlParseState.tagType}`);
        console.warn(`[未闭合标签信息] Buffer长度: ${this.xmlParseState.buffer.length}, 内容长度: ${this.xmlParseState.content.length}`);
        console.warn(`[Buffer内容]:`, this.xmlParseState.buffer.substring(0, 200));
        console.warn(`[累积内容前500字符]:`, this.xmlParseState.content.substring(0, 500));
        console.warn(`[累积内容后100字符]:`, this.xmlParseState.content.substring(Math.max(0, this.xmlParseState.content.length - 100)));

        // 尝试强制闭合标签
        const editor = this.getEditor();
        if (editor && this.xmlParseState.nodePos >= 0) {
          try {
            const { tr, state } = editor.state;
            if (state && state.doc) {
              const node = state.doc.nodeAt(this.xmlParseState.nodePos);
              if (node) {
                const finalContent = this.xmlParseState.content + this.xmlParseState.buffer;

                // 根据标签类型设置不同的属性
                if (this.xmlParseState.tagType === 'think') {
                  tr.setNodeMarkup(this.xmlParseState.nodePos, null, {
                    ...node.attrs,
                    content: finalContent,
                    isThinking: false
                  });
                } else {
                  tr.setNodeMarkup(this.xmlParseState.nodePos, null, {
                    ...node.attrs,
                    content: finalContent,
                    isProcessing: false
                  });
                }

                editor.view.dispatch(tr);
                console.log(`[强制闭合标签] ${this.xmlParseState.tagType} 已标记为完成，最终内容长度: ${finalContent.length}`);
              }
            }
          } catch (error) {
            console.error(`[强制闭合标签失败]`, error);
          }
        }

        // 清理状态
        this.xmlParseState.isInTag = false;
        this.xmlParseState.tagType = null;
        this.xmlParseState.content = '';
        this.xmlParseState.buffer = '';
        this.xmlParseState.nodePos = -1;
        this.xmlParseState.tagStack = [];
      }

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
        // 处理流式内容，检测和处理XML标签
        this.processStreamContent(message.content);
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
              console.error('Failed to parse SSE message:', data, e);
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

    // 清理XML解析状态
    this.xmlParseState = {
      isInTag: false,
      tagType: null,
      content: '',
      buffer: '',
      nodePos: -1,
      tagStack: []
    };
  }

  /**
   * 获取当前可用的 Tiptap 编辑器实例
   */
  private getEditor(): any {
    const chatEditor = this.runtime.data.chatOutputEditor;
    if (!chatEditor) return null;

    const editor = chatEditor.editor;
    if (!editor || !editor.state || !editor.view) return null;

    return editor;
  }

  /**
   * 处理流式内容，检测和处理XML标签
   */
  private processStreamContent(content: string): void {
    // 将内容添加到缓冲区
    this.xmlParseState.buffer += content;

    // 检查编辑器是否可用
    if (!this.getEditor()) {
      // 编辑器不可用，内容已缓存在buffer中，等待下次调用时处理
      return;
    }

    // 检测XML标签的开始（按优先级顺序：先检测think，再检测MutationPartial/HumanConfirmPartial）
    const thinkStartMatch = this.xmlParseState.buffer.match(/<think>/);
    const thinkEndMatch = this.xmlParseState.buffer.indexOf('</think>');
    const mutationStartMatch = this.xmlParseState.buffer.match(/<MutationPartial>/);
    const confirmStartMatch = this.xmlParseState.buffer.match(/<HumanConfirmPartial>/);

    if (!this.xmlParseState.isInTag) {
      // 当前不在标签内，检测标签开始

      // 优先检测 think 标签（可以在任何层级）
      if (thinkStartMatch) {
        // 处理标签前的普通文本（去除尾部多余换行）
        let beforeTag = this.xmlParseState.buffer.substring(0, thinkStartMatch.index);
        if (beforeTag) {
          // 去除尾部的多余换行，最多保留一个
          beforeTag = beforeTag.replace(/(\n|\r\n)+$/, '\n');
          this.appendNormalText(beforeTag);
        }

        // 开始新的think标签
        this.xmlParseState.isInTag = true;
        this.xmlParseState.tagType = 'think';
        this.xmlParseState.content = '';
        this.xmlParseState.buffer = this.xmlParseState.buffer.substring(thinkStartMatch.index! + '<think>'.length);
        this.xmlParseState.tagStack.push('think');

        console.log('[检测到 think 标签开始]');

        // 插入Think节点
        const editorT = this.getEditor();
        if (editorT) {
          editorT.chain().focus('end').insertThink('', true).run();

          // 插入后查找刚创建的节点位置
          this.xmlParseState.nodePos = this.findLastProcessingNode(editorT, 'vueThink');
          console.log(`[think 节点已插入] 位置: ${this.xmlParseState.nodePos}`);

          // 滚动到底部
          this.scrollToBottom();
        }

      } else if (mutationStartMatch && this.xmlParseState.tagStack.length === 0) {
        // 只在根层级（tagStack为空）时处理 MutationPartial
        // 处理标签前的普通文本（去除尾部多余换行）
        let beforeTag = this.xmlParseState.buffer.substring(0, mutationStartMatch.index);
        if (beforeTag) {
          // 去除尾部的多余换行，最多保留一个
          beforeTag = beforeTag.replace(/(\n|\r\n)+$/, '\n');
          this.appendNormalText(beforeTag);
        }

        // 开始新的MutationPartial标签
        this.xmlParseState.isInTag = true;
        this.xmlParseState.tagType = 'MutationPartial';
        this.xmlParseState.content = '';
        this.xmlParseState.buffer = this.xmlParseState.buffer.substring(mutationStartMatch.index! + '<MutationPartial>'.length);
        this.xmlParseState.tagStack.push('MutationPartial');

        console.log('[检测到 MutationPartial 标签开始（根层级）]');

        // 插入MutationPartial节点
        const editor1 = this.getEditor();
        if (editor1) {
          editor1.chain().focus('end').insertMutationPartial('', true).run();

          // 插入后查找刚创建的节点位置
          this.xmlParseState.nodePos = this.findLastProcessingNode(editor1, 'vueMutationPartial');
          console.log(`[MutationPartial 节点已插入] 位置: ${this.xmlParseState.nodePos}`);

          // 滚动到底部
          this.scrollToBottom();
        }

      } else if (confirmStartMatch && this.xmlParseState.tagStack.length === 0) {
        // 只在根层级（tagStack为空）时处理 HumanConfirmPartial
        // 处理标签前的普通文本（去除尾部多余换行）
        let beforeTag = this.xmlParseState.buffer.substring(0, confirmStartMatch.index);
        if (beforeTag) {
          // 去除尾部的多余换行，最多保留一个
          beforeTag = beforeTag.replace(/(\n|\r\n)+$/, '\n');
          this.appendNormalText(beforeTag);
        }

        // 开始新的HumanConfirmPartial标签
        this.xmlParseState.isInTag = true;
        this.xmlParseState.tagType = 'HumanConfirmPartial';
        this.xmlParseState.content = '';
        this.xmlParseState.buffer = this.xmlParseState.buffer.substring(confirmStartMatch.index! + '<HumanConfirmPartial>'.length);
        this.xmlParseState.tagStack.push('HumanConfirmPartial');

        console.log('[检测到 HumanConfirmPartial 标签开始（根层级）]');

        // 插入HumanConfirmPartial节点
        const editor2 = this.getEditor();
        if (editor2) {
          editor2.chain().focus('end').insertHumanConfirmPartial('', true).run();

          // 插入后查找刚创建的节点位置
          this.xmlParseState.nodePos = this.findLastProcessingNode(editor2, 'vueHumanConfirmPartial');
          console.log(`[HumanConfirmPartial 节点已插入] 位置: ${this.xmlParseState.nodePos}`);

          // 滚动到底部
          this.scrollToBottom();
        }

      } else {
        // 没有检测到标签开始，输出普通文本
        // 保留最后50个字符以防标签被分割
        if (this.xmlParseState.buffer.length > 50) {
          const textToAppend = this.xmlParseState.buffer.substring(0, this.xmlParseState.buffer.length - 50);
          this.appendNormalText(textToAppend);
          this.xmlParseState.buffer = this.xmlParseState.buffer.substring(textToAppend.length);
        }
      }
    } else {
      // 当前在标签内，检测标签结束
      let endTag = '';
      if (this.xmlParseState.tagType === 'MutationPartial') {
        endTag = '</MutationPartial>';
      } else if (this.xmlParseState.tagType === 'HumanConfirmPartial') {
        endTag = '</HumanConfirmPartial>';
      } else if (this.xmlParseState.tagType === 'think') {
        endTag = '</think>';
      }

      // 在完整内容（已累积内容 + 当前buffer）中查找结束标签
      const fullContent = this.xmlParseState.content + this.xmlParseState.buffer;
      const endMatch = fullContent.indexOf(endTag);

      // 调试日志：只在找到结束标签时输出
      if (endMatch !== -1 && this.xmlParseState.buffer.length > 0) {
        console.log(`[标签内-即将闭合] 标签类型: ${this.xmlParseState.tagType}, 累积内容长度: ${this.xmlParseState.content.length}`);
      }

      if (endMatch !== -1) {
        console.log(`[★找到结束标签★] 在位置: ${endMatch}, 标签类型: ${this.xmlParseState.tagType}`);

        // 找到结束标签
        const tagContentOnly = fullContent.substring(0, endMatch);
        const afterEndTag = fullContent.substring(endMatch + endTag.length);

        console.log(`[内容分割] 标签内容长度: ${tagContentOnly.length}, 标签后内容长度: ${afterEndTag.length}`);

        // 设置最终内容
        this.xmlParseState.content = tagContentOnly;

        console.log(`[XML标签闭合] 类型: ${this.xmlParseState.tagType}, 内容长度: ${this.xmlParseState.content.length}, 节点位置: ${this.xmlParseState.nodePos}`);

        // 使用记录的位置更新特定节点
        const nodePos = this.xmlParseState.nodePos;
        const editor3 = this.getEditor();

        console.log(`[准备更新节点] nodePos: ${nodePos}, editor3存在: ${!!editor3}, state存在: ${!!(editor3?.state)}, view存在: ${!!(editor3?.view)}`);

        if (nodePos >= 0 && editor3 && editor3.state && editor3.state.doc && editor3.view) {
          try {
            // 直接使用 editor3.state，不解构
            const node = editor3.state.doc.nodeAt(nodePos);

            if (node) {
              console.log(`[更新节点] 位置: ${nodePos}, 节点类型: ${node.type.name}, 当前内容长度: ${node.attrs.content?.length || 0}`);

              // 创建新的 transaction
              const tr = editor3.state.tr;

              // 根据标签类型更新节点
              if (this.xmlParseState.tagType === 'think') {
                // think 节点：更新内容并标记为完成
                tr.setNodeMarkup(nodePos, null, {
                  ...node.attrs,
                  content: this.xmlParseState.content,
                  isThinking: false
                });
              } else {
                // MutationPartial 和 HumanConfirmPartial：更新内容并标记为完成
                tr.setNodeMarkup(nodePos, null, {
                  ...node.attrs,
                  content: this.xmlParseState.content,
                  isProcessing: false
                });
              }

              editor3.view.dispatch(tr);
              console.log(`[节点已完成] ${this.xmlParseState.tagType} 节点已标记为完成`);

              // 滚动到底部
              this.scrollToBottom();
            } else {
              console.error(`[节点未找到] 位置 ${nodePos} 处没有找到节点`);
            }
          } catch (error) {
            console.error(`[更新节点失败]`, error);
          }
        } else {
          if (nodePos < 0) {
            console.error(`[节点位置无效] nodePos = ${nodePos}`);
          } else {
            console.error(`[编辑器状态无效] 详情: editor=${!!editor3}, state=${!!(editor3?.state)}, state.doc=${!!(editor3?.state?.doc)}, view=${!!(editor3?.view)}`);
          }
        }

        // 移动光标到文档末尾，确保后续内容追加到正确位置
        const editor3b = this.getEditor();
        if (editor3b && editor3b.commands) {
          editor3b.commands.focus('end');
        }

        // 从栈中弹出当前标签
        this.xmlParseState.tagStack.pop();

        // 重置当前标签状态，继续处理剩余内容
        this.xmlParseState.isInTag = false;
        this.xmlParseState.tagType = null;
        this.xmlParseState.content = '';
        this.xmlParseState.nodePos = -1;

        // 设置buffer为结束标签之后的内容，去除开头的多余换行（最多保留一个）
        let afterContent = afterEndTag;

        // 如果开头有连续的换行符，只保留一个
        const leadingNewlines = afterContent.match(/^(\n|\r\n)+/);
        if (leadingNewlines) {
          afterContent = '\n' + afterContent.substring(leadingNewlines[0].length);
        }

        this.xmlParseState.buffer = afterContent;

        // 递归处理剩余内容
        if (this.xmlParseState.buffer.length > 0) {
          const remaining = this.xmlParseState.buffer;
          this.xmlParseState.buffer = '';
          console.log(`[继续处理剩余内容] 长度: ${remaining.length}, 当前层级: ${this.xmlParseState.tagStack.length}`);
          this.processStreamContent(remaining);
        }

      } else {
        // 还未找到结束标签，继续累积内容
        this.xmlParseState.content += this.xmlParseState.buffer;

        // 对于 think 标签，实时更新显示内容；对于其他标签，不频繁更新
        if (this.xmlParseState.tagType === 'think') {
          const nodePos = this.xmlParseState.nodePos;
          const editorThink = this.getEditor();

          if (nodePos >= 0 && editorThink && editorThink.state && editorThink.state.doc && editorThink.view) {
            try {
              const node = editorThink.state.doc.nodeAt(nodePos);

              if (node) {
                const tr = editorThink.state.tr;
                tr.setNodeMarkup(nodePos, null, {
                  ...node.attrs,
                  content: this.xmlParseState.content
                });

                editorThink.view.dispatch(tr);

                // 每隔一段时间滚动一次（避免太频繁）
                if (this.xmlParseState.content.length % 100 < 10) {
                  this.scrollToBottom();
                }
              }
            } catch (error) {
              // 静默失败，不影响流程
            }
          }
        }
        // 对于 MutationPartial 和 HumanConfirmPartial，只累积内容，等待标签闭合时一次性更新

        this.xmlParseState.buffer = '';
      }
    }
  }

  /**
   * 追加普通文本到编辑器
   */
  private appendNormalText(text: string): void {
    const chatEditor = this.runtime.data.chatOutputEditor;
    if (!chatEditor) return;

    // 跳过空文本或只有空白的文本
    if (!text || text.trim() === '') {
      // 如果只是换行符，最多添加一个硬换行
      if (text.includes('\n')) {
        chatEditor.appendHardBreak();
      }
      return;
    }

    // 检查内容中是否包含换行符
    if (text.includes('\n')) {
      // 有换行符，按行处理
      const lines = text.split('\n');
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
      chatEditor.appendText(text);
    }
  }

  /**
   * 滚动到底部
   */
  private scrollToBottom(): void {
    const chatEditor = this.runtime.data.chatOutputEditor;
    if (chatEditor && chatEditor.scrollToBottom) {
      // 延迟执行，确保 DOM 已更新
      setTimeout(() => {
        chatEditor.scrollToBottom();
      }, 50);
    }
  }

  /**
   * 查找最后一个处理中的节点位置
   */
  private findLastProcessingNode(editor: any, nodeTypeName: string): number {
    if (!editor || !editor.state || !editor.state.doc) {
      console.error('[查找节点失败] editor.state.doc 不可用');
      return -1;
    }

    let lastPos = -1;

    try {
      editor.state.doc.descendants((node: any, pos: number) => {
        // 根据节点类型检查不同的状态属性
        if (nodeTypeName === 'vueThink') {
          if (node.type.name === nodeTypeName && node.attrs.isThinking) {
            lastPos = pos;
          }
        } else {
          if (node.type.name === nodeTypeName && node.attrs.isProcessing) {
            lastPos = pos;
          }
        }
      });
    } catch (error) {
      console.error('[查找节点异常]', error);
      return -1;
    }

    return lastPos;
  }
}
