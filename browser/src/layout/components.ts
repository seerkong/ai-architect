// ========== 简单占位组件 - 用于显示文本 ==========
export class PlaceholderComponent {
  element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.style.width = '100%';
    this.element.style.height = '100%';
  }

  init(params: { params?: { text?: string; style?: string } }) {
    const text = params?.params?.text || '占位内容';
    const style = params?.params?.style || 'padding: 10px; color: #666; white-space: pre-wrap; height: 100%; overflow: auto;';
    
    this.element.innerHTML = `
      <div style="${style}">
        ${text}
      </div>
    `;
  }

  update(params: any) {}
  dispose() {}
}

// ========== 编辑器容器组件 - 创建带特定ID的容器 ==========
export class EditorContainerComponent {
  element: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.style.width = '100%';
    this.element.style.height = '100%';
  }

  init(params: { params?: { containerId?: string } }) {
    const containerId = params?.params?.containerId || 'default-container';
    
    // 直接创建带ID的容器，不嵌套
    this.element.innerHTML = '';
    const container = document.createElement('div');
    container.id = containerId;
    container.style.width = '100%';
    container.style.height = '100%';
    this.element.appendChild(container);
    
    console.log(`编辑器容器已创建: ${containerId}`);
  }

  update(params: any) {}
  dispose() {}
}

