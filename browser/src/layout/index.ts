import { SplitviewComponent, Orientation, IView, Sizing, DockviewEmitter as Emitter } from 'dockview-core';
import 'dockview-core/dist/styles/dockview.css';
import { createLeftPanel, initLeftDslPaneview, initLeftSidebarTabs } from './left-panel';
import { createCenterPanel, initCenterEditorDockview } from './center-panel';
import { createRightPanel, initRightDockview } from './right-panel';

// ========== 简单的面板包装类，实现 IView 接口 ==========
class SimpleSplitviewPanel implements IView {
  readonly element: HTMLElement;
  private _onDidChange = new Emitter<{ size?: number; orthogonalSize?: number }>();
  readonly onDidChange = this._onDidChange.event;
  
  minimumSize = 200;
  maximumSize = Infinity;
  snap = false;
  
  constructor(element: HTMLElement, minSize = 200, maxSize = Infinity) {
    this.element = element;
    this.minimumSize = minSize;
    this.maximumSize = maxSize;
  }
  
  layout(size: number, orthogonalSize: number): void {
    // 布局调整时自动处理
  }
  
  setVisible(visible: boolean): void {
    this.element.style.display = visible ? '' : 'none';
  }
  
  dispose(): void {
    this._onDidChange.dispose();
  }
}

// ========== 主布局初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
  console.log('开始初始化 Dockview 布局...');

  const mainContent = document.querySelector('.main-content') as HTMLElement;
  if (!mainContent) {
    console.error('.main-content 容器未找到');
    return;
  }

  // 创建主 Splitview（左中右布局）
  const splitview = new SplitviewComponent(mainContent, {
    orientation: Orientation.HORIZONTAL,
    proportionalLayout: true, // 启用比例布局，让中间区域随窗口增长
    createComponent: (options: any): any => {
      // 返回一个虚拟面板（实际使用 addView 而不是 addPanel）
      return new SimpleSplitviewPanel(document.createElement('div'));
    }
  });

  console.log('主 Splitview 已创建');

  // ===== 添加左侧面板 =====
  const leftPanelElement = createLeftPanel();
  const leftView = new SimpleSplitviewPanel(leftPanelElement, 200, 600);
  splitview.splitview.addView(leftView, 300);

  console.log('左侧面板已添加');

  // ===== 添加中部编辑器区域 =====
  const centerPanelElement = createCenterPanel();
  const centerView = new SimpleSplitviewPanel(centerPanelElement, 400, Infinity);
  splitview.splitview.addView(centerView, Sizing.Distribute);

  console.log('中部面板已添加');

  // ===== 添加右侧面板 =====
  const rightPanelElement = createRightPanel();
  const rightView = new SimpleSplitviewPanel(rightPanelElement, 250, 600);
  splitview.splitview.addView(rightView, 350);

  console.log('右侧面板已添加');

  // 等待 DOM 更新后初始化各区域的 Dockview
  setTimeout(() => {
    console.log('开始初始化各区域的 Dockview...');
    
    // 初始化左侧
    initLeftDslPaneview();
    initLeftSidebarTabs();
    
    // 初始化中部
    initCenterEditorDockview();
    
    // 初始化右侧
    initRightDockview();
    
    // 触发就绪事件
    setTimeout(() => {
      const dockviewReadyEvent = new CustomEvent('dockview-ready');
      document.dispatchEvent(dockviewReadyEvent);
      console.log('Dockview 布局完全就绪');
    }, 300);
  }, 100);

  // 绑定顶部菜单事件
  initTopMenu();
});

// ========== 顶部菜单事件 ==========
function initTopMenu() {
  const exportHtmlMenu = document.getElementById('export-html-menu');
  if (exportHtmlMenu) {
    exportHtmlMenu.addEventListener('click', () => {
      const event = new CustomEvent('export-tech-doc-html');
      document.dispatchEvent(event);
      console.log('触发导出 HTML 事件');
    });
  }
}

