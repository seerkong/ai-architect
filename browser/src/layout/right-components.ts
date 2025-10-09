// ========== 右侧：项目操作组件（上部） ==========
export class ProjectActionsComponent {
  element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.style.width = '100%';
    this.element.style.height = '100%';
  }

  init(params: any) {
    this.element.innerHTML = `
      <div style="padding: 8px; background: #fff; height: 100%; overflow: hidden; display: flex; flex-direction: column; gap: 6px;">
        <!-- 项目Key输入 -->
        <div style="display: flex; gap: 6px; align-items: center;">
          <span style="min-width: 60px; font-size: 11px; color: #666;">项目Key</span>
          <input type="text" id="project-key" style="flex: 1; padding: 4px 6px; border: 1px solid #ccc; border-radius: 2px; font-size: 11px;" placeholder="项目key" value="">
          <button id="update-websocket" style="padding: 4px 8px; background: #0e639c; color: white; border: none; border-radius: 2px; cursor: pointer; font-size: 11px;">更新</button>
        </div>
        
        <!-- 会话ID输入 -->
        <div style="display: flex; gap: 6px; align-items: center;">
          <span style="min-width: 60px; font-size: 11px; color: #666;">会话ID</span>
          <input type="text" id="conversation-id" style="flex: 1; padding: 4px 6px; border: 1px solid #ccc; border-radius: 2px; font-size: 11px;" placeholder="会话ID" value="">
        </div>

        <!-- 操作按钮 -->
        <div style="display: flex; gap: 4px;">
          <button id="update-detail-btn" style="flex: 1; padding: 5px 8px; background: #0e639c; color: white; border: none; border-radius: 2px; cursor: pointer; font-size: 11px;">拉取详情</button>
          <button id="answer-confirm-btn" style="flex: 1; padding: 5px 8px; background: #0e8a16; color: white; border: none; border-radius: 2px; cursor: pointer; font-size: 11px;">回答确认项</button>
        </div>
      </div>
    `;
  }

  update(params: any) {}
  dispose() {}
}

// ========== 右侧：对话历史组件（中部） ==========
export class ChatHistoryComponent {
  element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.style.width = '100%';
    this.element.style.height = '100%';
  }

  init(params: any) {
    this.element.innerHTML = `
      <div id="chat-output" class="chat-history-panel">
        等待输入...
      </div>
    `;
  }

  update(params: any) {}
  dispose() {}
}

// ========== 右侧：对话输入组件（下部） ==========
export class ChatInputComponent {
  element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.style.width = '100%';
    this.element.style.height = '100%';
  }

  init(params: any) {
    this.element.innerHTML = `
      <div style="padding: 8px; background: #fff; height: 100%; display: flex; flex-direction: column; gap: 6px;">
        <!-- 输入框 -->
        <textarea id="chat-input" style="flex: 1; min-height: 60px; padding: 8px; border: 1px solid #ccc; border-radius: 3px; font-size: 12px; font-family: inherit; resize: none;" placeholder="输入你的问题..."></textarea>
        
        <!-- 控制区 -->
        <div style="display: flex; gap: 4px; align-items: center;">
          <!-- 模式切换 -->
          <select id="mode-switch" style="flex: 1; padding: 5px 6px; border: 1px solid #ccc; border-radius: 2px; font-size: 11px; background: #fff;">
            <option value="">选择模式</option>
            <option value="reset-input-and-init-modules">1 导入需求&初拆模块</option>
            <option value="module-design">2 技术设计</option>
          </select>
          
          <!-- 接受变更按钮 - 图标 -->
          <button id="accept-changes-btn" title="接受变更" style="padding: 5px 8px; background: #0e8a16; color: white; border: none; border-radius: 2px; cursor: pointer; font-size: 16px; line-height: 1; width: 32px; height: 28px;">✓</button>
          
          <!-- 发送按钮 - 图标 -->
          <button id="startChatBtn" title="发送" style="padding: 5px 8px; background: #0e639c; color: white; border: none; border-radius: 2px; cursor: pointer; font-size: 16px; line-height: 1; width: 32px; height: 28px;">▶</button>
          
          <!-- 停止按钮 - 图标 -->
          <button id="stopChatBtn" title="停止" disabled style="padding: 5px 8px; background: #d73a49; color: white; border: none; border-radius: 2px; cursor: pointer; font-size: 16px; line-height: 1; width: 32px; height: 28px; opacity: 0.5;">■</button>
        </div>
      </div>
    `;
  }

  update(params: any) {}
  dispose() {}
}

