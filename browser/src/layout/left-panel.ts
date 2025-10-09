import { PaneviewComponent } from 'dockview-core';
import { EditorContainerComponent } from './components';

// 创建左侧面板容器
export function createLeftPanel(): HTMLElement {
  const leftPanel = document.createElement('div');
  leftPanel.className = 'sidebar-left';
  leftPanel.innerHTML = `
    <div class="sidebar-tabs">
      <div class="sidebar-tab active" data-tab="dsl-tab">文档DSL</div>
      <div class="sidebar-tab" data-tab="input-tab">项目输入</div>
    </div>
    <div class="sidebar-content">
      <!-- DSL Tab 内容 -->
      <div class="sidebar-panel active" id="dsl-tab">
        <div id="dsl-dockview-container" class="dockview-container"></div>
      </div>
      <!-- 项目输入 Tab 内容 -->
      <div class="sidebar-panel" id="input-tab">
        <div style="padding: 12px; background: #fff; height: 100%; overflow: auto;">
          <div class="input-group">
            <div class="input-label">PRD文档链接</div>
            <input type="text" id="prd-link" class="input-field" placeholder="请输入PRD文档链接" value="">
          </div>
          <div class="input-group">
            <div class="input-label">技术选型约束文档链接</div>
            <input type="text" id="tech-constraints-link" class="input-field" placeholder="请输入技术选型约束文档链接" value="">
          </div>
          <div class="input-group">
            <div class="input-label">生成技术文档链接</div>
            <input type="text" id="tech-design-doc-link" class="input-field" placeholder="请输入技术文档链接" value="">
          </div>
        </div>
      </div>
    </div>
  `;

  return leftPanel;
}

// 初始化左侧 DSL Paneview（创建3个占位容器，真实组件由 AIAgent Actor 初始化）
export function initLeftDslPaneview() {
  const container = document.getElementById('dsl-dockview-container');
  if (!container) {
    console.error('dsl-dockview-container 未找到');
    return null;
  }

  const paneview = new PaneviewComponent(container, {
    createComponent(options: any) {
      const component = new EditorContainerComponent();
      component.init(options);
      return component;
    },
  });

  // 添加 3 个容器面板，真实的JSON可视化将在 AIAgent Actor 中初始化
  const dslPanel = paneview.addPanel({
    id: 'dsl-visualizer',
    component: 'editor-container',
    title: '技术文档DSL',
    isExpanded: true,
    params: { 
      containerId: 'dsl-visualizer-mount'
    }
  });

  const conversationPanel = paneview.addPanel({
    id: 'conversation-mutation',
    component: 'editor-container',
    title: '当前对话变更',
    isExpanded: true,
    params: { 
      containerId: 'conversation-visualizer-mount'
    }
  });

  const answerPanel = paneview.addPanel({
    id: 'answer-mutation',
    component: 'editor-container',
    title: '当前回答变更',
    isExpanded: true,
    params: { 
      containerId: 'answer-visualizer-mount'
    }
  });

  // 调整面板高度，各占 1/3
  setTimeout(() => {
    const containerHeight = container.offsetHeight;
    const titleBarHeight = 22 * 3;
    const availableHeight = containerHeight - titleBarHeight;
    const panelHeight = Math.floor(availableHeight / 3);
    
    if (dslPanel) {
      dslPanel.api.setSize({ size: panelHeight });
    }
    if (conversationPanel) {
      conversationPanel.api.setSize({ size: panelHeight });
    }
    if (answerPanel) {
      answerPanel.api.setSize({ size: panelHeight });
    }
    
    console.log('左侧面板高度已设置');
  }, 300);

  console.log('左侧 DSL Paneview 初始化完成（占位）');
  return paneview;
}

// 初始化左侧 Tab 切换
export function initLeftSidebarTabs() {
  const sidebarTabs = document.querySelectorAll('.sidebar-tab');
  const sidebarPanels = document.querySelectorAll('.sidebar-panel');
  
  sidebarTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.getAttribute('data-tab');
      
      sidebarTabs.forEach(t => t.classList.remove('active'));
      sidebarPanels.forEach(p => p.classList.remove('active'));
      
      tab.classList.add('active');
      document.getElementById(targetTab!)?.classList.add('active');
      
      console.log('切换到 tab:', targetTab);
    });
  });
  
  console.log('左侧 Tab 切换已初始化');
}
