import { DockviewComponent, DockviewTheme } from 'dockview-core';
import { PlaceholderComponent, EditorContainerComponent } from './components';

const themeLight: DockviewTheme = {
  name: 'light',
  className: 'dockview-theme-light',
};

// 创建中部编辑器区域容器
export function createCenterPanel(): HTMLElement {
  const centerPanel = document.createElement('div');
  centerPanel.className = 'editor-area';
  centerPanel.innerHTML = '<div id="editor-dockview-container" class="dockview-container"></div>';
  
  return centerPanel;
}

// 初始化中部编辑器 Dockview（多标签页编辑器）
export function initCenterEditorDockview() {
  const container = document.getElementById('editor-dockview-container');
  if (!container) {
    console.error('editor-dockview-container 未找到');
    return null;
  }

  const dockview = new DockviewComponent(container, {
    createComponent(options: any) {
      let component;
      // 根据组件类型选择不同的组件类
      switch (options.name) {
        case 'rich-text-placeholder':
          component = new PlaceholderComponent();
          break;
        case 'editor-container':
          component = new EditorContainerComponent();
          break;
        default:
          component = new PlaceholderComponent();
      }
      component.init(options);
      return component;
    },
    theme: themeLight,
    locked: false, // 中部编辑器允许标签页拖拽重排（不删除）
  });

  // 添加富文本编辑器占位容器（Editor Actor 将在此初始化真实编辑器）
  dockview.addPanel({
    id: 'rich-text-editor',
    component: 'editor-container',
    title: '技术设计文档',
    params: { 
      containerId: 'rich-text-editor-container'
    }
  });


  // 添加技术约束文档容器（带正确的ID）
  dockview.addPanel({
    id: 'tech-constraints-tab',
    component: 'editor-container',
    title: '技术约束文档',
    inactive: true,
    params: { 
      containerId: 'tech-constraints-editor'
    }
  });

  // 添加PRD-原始容器（带正确的ID）
  dockview.addPanel({
    id: 'source-prd-tab',
    component: 'editor-container',
    title: 'PRD-原始',
    inactive: true,
    params: { 
      containerId: 'source-prd-editor'
    }
  });

  // 添加PRD-转换后容器（带正确的ID）
  dockview.addPanel({
    id: 'parsed-prd-tab',
    component: 'editor-container',
    title: 'PRD-转换后',
    inactive: true,
    params: { 
      containerId: 'parsed-prd-editor'
    }
  });

  
  // 添加HTML编辑器容器（带正确的ID）
  dockview.addPanel({
    id: 'html-editor-tab',
    component: 'editor-container',
    title: '技术文档(HTML)',
    inactive: true,
    params: { 
      containerId: 'html-editor'
    }
  });

  console.log('中部编辑器 Dockview 初始化完成');
  return dockview;
}
