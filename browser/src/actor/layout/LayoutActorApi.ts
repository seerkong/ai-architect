import { ActorApi } from 'src/framework/ActorApi';
import { AiWebArchitectMesh } from '../mesh/AiWebArchitectMesh';

export interface LayoutActorApi extends ActorApi<void> {

}

export class LayoutActorLogic implements LayoutActorApi {
  private mesh: AiWebArchitectMesh;

  constructor(mesh: AiWebArchitectMesh) {
    this.mesh = mesh;
  }

  async mount(): Promise<void> {
    // TODO初始化组件
  }

  async connect(): Promise<void> {
    console.log('LayoutActorApi: 开始初始化布局...');

    // 等待 DOM 加载完成
    await this.waitForDOMReady();
    
    // 等待 dockview 布局就绪
    await this.waitForDockviewReady();
    
    console.log('LayoutActorApi: 布局初始化完成');
  }

  private waitForDOMReady(): Promise<void> {
    return new Promise((resolve) => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => resolve());
      } else {
        resolve();
      }
    });
  }

  private waitForDockviewReady(): Promise<void> {
    return new Promise((resolve) => {
      let resolved = false;
      
      // 监听 dockview-ready 事件（由 layout/index.ts 触发）
      const listener = () => {
        if (!resolved) {
          resolved = true;
          console.log('LayoutActorApi: 收到 dockview-ready 事件，布局已就绪');
          document.removeEventListener('dockview-ready', listener);
          resolve();
        }
      };
      
      document.addEventListener('dockview-ready', listener);

      // 超时保护（5秒应该足够）
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          document.removeEventListener('dockview-ready', listener);
          console.warn('LayoutActorApi: 等待布局超时，强制继续');
          resolve();
        }
      }, 5000);
    });
  }
}

