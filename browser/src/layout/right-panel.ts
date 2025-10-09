import { PaneviewComponent } from 'dockview-core';
import { ProjectActionsComponent, ChatHistoryComponent, ChatInputComponent } from './right-components';

// 创建右侧面板容器
export function createRightPanel(): HTMLElement {
  const rightPanel = document.createElement('div');
  rightPanel.className = 'sidebar-right';
  rightPanel.innerHTML = '<div id="right-dockview-container" class="dockview-container"></div>';
  
  return rightPanel;
}

// 初始化右侧 Paneview（上中下 3 个可拖拽调整大小的面板）
export function initRightDockview() {
  const container = document.getElementById('right-dockview-container');
  if (!container) {
    console.error('right-dockview-container 未找到');
    return null;
  }

  const paneview = new PaneviewComponent(container, {
    createComponent(options: any) {
      let component;
      switch (options.name) {
        case 'project-actions':
          component = new ProjectActionsComponent();
          break;
        case 'chat-history':
          component = new ChatHistoryComponent();
          break;
        case 'chat-input':
          component = new ChatInputComponent();
          break;
        default:
          component = new ChatHistoryComponent();
      }
      component.init(options);
      return component;
    },
  });

  // 上部：项目操作区域（固定高度，不可拖动）
  const projectPanel = paneview.addPanel({
    id: 'project-actions',
    component: 'project-actions',
    title: 'AI架构师',
    isExpanded: true, // 默认展开
    minimumBodySize: 110,
    maximumBodySize: 110, // 设置相同的最小和最大值，固定高度
  });

  // 中部：对话历史（占据大部分空间，默认展开）
  const historyPanel = paneview.addPanel({
    id: 'chat-history',
    component: 'chat-history',
    title: '对话历史',
    isExpanded: true, // 默认展开
    minimumBodySize: 200,
  });

  // 下部：对话输入（紧凑，默认展开）
  const inputPanel = paneview.addPanel({
    id: 'chat-input',
    component: 'chat-input',
    title: '对话输入',
    isExpanded: true, // 默认展开
    minimumBodySize: 100,
    maximumBodySize: 250,
  });

  // 调整面板初始大小
  setTimeout(() => {
    const containerHeight = container.offsetHeight;
    console.log('右侧容器总高度:', containerHeight);
    
    // AI架构师：110px（固定，由 min/max 限制）
    const projectActionsHeight = 110;
    
    // 计算剩余可用高度（减去3个标题栏高度）
    const titleBarHeight = 22 * 3; // 每个面板都有标题栏
    const availableHeight = containerHeight - projectActionsHeight - titleBarHeight;
    
    // 对话历史和对话输入按 70:30 分配
    const chatHistoryHeight = Math.floor(availableHeight * 0.7);
    const chatInputHeight = Math.floor(availableHeight * 0.3);
    
    console.log('计算高度 - 可用空间:', availableHeight, 'px');
    console.log('分配 - 对话历史(70%):', chatHistoryHeight, 'px, 对话输入(30%):', chatInputHeight, 'px');
    
    // 设置初始大小
    // AI架构师已经通过 min/max 固定为 110px
    projectPanel.api.setSize({ size: projectActionsHeight });
    
    // 设置对话历史和对话输入的大小
    historyPanel.api.setSize({ size: chatHistoryHeight });
    inputPanel.api.setSize({ size: chatInputHeight });
    
    console.log('右侧面板高度已设置完成');
  }, 300);

  console.log('右侧 Paneview 初始化完成');
  return paneview;
}
