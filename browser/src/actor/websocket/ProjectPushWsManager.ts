/**
 * WebSocket推送消息类型
 */
export interface PushMessage {
  event: string;
  content?: any;
  data?: any;
  conversationId?: string;
  messageId?: string;
  timestamp: string;
}

/**
 * WebSocket推送连接状态
 */
export enum WebSocketStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error'
}

/**
 * 项目WebSocket推送管理器
 * 负责管理与服务器的WebSocket推送连接
 */
export class ProjectPushWsManager {
  private ws: WebSocket | null = null;
  private projectKey: string = '';
  private status: WebSocketStatus = WebSocketStatus.DISCONNECTED;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 3000;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  // 事件回调
  private onStatusChange: ((status: WebSocketStatus) => void) | null = null;
  private onMessage: ((message: PushMessage) => void) | null = null;
  private onError: ((error: Error) => void) | null = null;

  /**
   * 设置状态变化回调
   */
  public setOnStatusChange(callback: (status: WebSocketStatus) => void): void {
    this.onStatusChange = callback;
  }

  /**
   * 设置消息接收回调
   */
  public setOnMessage(callback: (message: PushMessage) => void): void {
    this.onMessage = callback;
  }

  /**
   * 设置错误回调
   */
  public setOnError(callback: (error: Error) => void): void {
    this.onError = callback;
  }

  /**
   * 获取当前状态
   */
  public getStatus(): WebSocketStatus {
    return this.status;
  }

  /**
   * 获取当前项目键
   */
  public getProjectKey(): string {
    return this.projectKey;
  }

  /**
   * 连接到指定项目的WebSocket推送端点
   */
  public connect(projectKey: string): void {
    if (!projectKey.trim()) {
      console.warn('ProjectPushWsManager: 项目键不能为空');
      return;
    }

    // 如果已经连接到相同项目，不需要重新连接
    if (this.status === WebSocketStatus.CONNECTED && this.projectKey === projectKey) {
      console.log(`ProjectPushWsManager: 已经连接到项目 ${projectKey}`);
      return;
    }

    // 先断开现有连接
    this.disconnect();

    this.projectKey = projectKey;
    this.updateStatus(WebSocketStatus.CONNECTING);

    try {
      // 动态获取当前页面的域名和端口号
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws/push/${encodeURIComponent(projectKey)}`;
      console.log(`ProjectPushWsManager: 正在连接到 ${wsUrl}`);

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log(`ProjectPushWsManager: 连接到项目 ${projectKey} 成功`);
        this.updateStatus(WebSocketStatus.CONNECTED);
        this.reconnectAttempts = 0;
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: PushMessage = JSON.parse(event.data);
          if (message.event !== 'ping'
            && message.event !== 'pong'
            && message.event !== 'welcome'
            && message.event !== 'heartbeat'
          ) {
            console.log('ProjectPushWsManager: 收到推送消息', message);
          }

          if (this.onMessage) {
            // this.onMessage(message);
          }
        } catch (error) {
          console.error('ProjectPushWsManager: 消息解析错误', error);
          if (this.onError) {
            this.onError(new Error('消息解析失败'));
          }
        }
      };

      this.ws.onclose = (event) => {
        console.log(`ProjectPushWsManager: 连接关闭`, event.code, event.reason);
        this.cleanup();
        this.updateStatus(WebSocketStatus.DISCONNECTED);

        // 如果不是主动关闭，尝试重连
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('ProjectPushWsManager: WebSocket错误', error);
        this.updateStatus(WebSocketStatus.ERROR);
        if (this.onError) {
          this.onError(new Error('WebSocket连接错误'));
        }
      };

    } catch (error) {
      console.error('ProjectPushWsManager: 连接失败', error);
      this.updateStatus(WebSocketStatus.ERROR);
      if (this.onError) {
        this.onError(new Error('连接失败'));
      }
    }
  }

  /**
   * 断开WebSocket连接
   */
  public disconnect(): void {
    if (this.ws) {
      console.log('ProjectPushWsManager: 主动断开连接');
      this.ws.close(1000, 'Client disconnect');
    }
    this.cleanup();
    this.updateStatus(WebSocketStatus.DISCONNECTED);
  }

  /**
   * 发送ping消息
   */
  public sendPing(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'ping',
        timestamp: new Date().toISOString()
      }));
    }
  }

  /**
   * 更新连接状态
   */
  private updateStatus(status: WebSocketStatus): void {
    if (this.status !== status) {
      this.status = status;
      if (this.onStatusChange) {
        this.onStatusChange(status);
      }
    }
  }

  /**
   * 清理资源
   */
  private cleanup(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    this.ws = null;
  }

  /**
   * 启动心跳机制
   */
  private startHeartbeat(): void {
    // 每30秒发送一次ping
    this.heartbeatInterval = setInterval(() => {
      this.sendPing();
    }, 30000);
  }

  /**
   * 安排重连
   */
  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`ProjectPushWsManager: ${delay}ms后尝试第${this.reconnectAttempts}次重连`);

    setTimeout(() => {
      if (this.projectKey) {
        this.connect(this.projectKey);
      }
    }, delay);
  }
}
