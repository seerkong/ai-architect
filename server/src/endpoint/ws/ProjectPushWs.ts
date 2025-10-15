import { logger } from '../../helper/logger';
import { Logger, logger as defaultLogger } from "../../helper/logger";

/**
 * WebSocket连接信息
 */
export interface WebSocketConnection {
  id: string;
  websocket: any;
  projectKey: string;
  connectedAt: Date;
  lastHeartbeat: Date;
}

/**
 * 推送消息类型
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
 * 项目推送WebSocket端点类
 * 用于维护项目相关的WebSocket连接，并支持消息推送
 */
export class ProjectPushWs {
  private static instance: ProjectPushWs;
  private connections: Map<string, WebSocketConnection[]> = new Map();
  private heartbeatIntervals: Map<string, NodeJS.Timeout> = new Map();
  private logger: typeof logger;

  private constructor() {
    this.logger = defaultLogger;
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): ProjectPushWs {
    if (!ProjectPushWs.instance) {
      ProjectPushWs.instance = new ProjectPushWs();
    }
    return ProjectPushWs.instance;
  }

  /**
   * 处理WebSocket连接
   * @param ctx WebSocket上下文
   */
  public handleConnection(ctx: any): void {
    const projectKey = ctx.params.projectKey;
    if (!projectKey) {
      this.logger.error('WebSocket连接缺少projectKey参数');
      ctx.websocket.close(1000, 'Missing projectKey parameter');
      return;
    }

    const connectionId = this.generateConnectionId();
    const connection: WebSocketConnection = {
      id: connectionId,
      websocket: ctx.websocket,
      projectKey: projectKey,
      connectedAt: new Date(),
      lastHeartbeat: new Date()
    };

    // 添加到连接映射
    this.addConnection(projectKey, connection);
    this.logger.info(`WebSocket推送连接建立，项目: ${projectKey}, 连接ID: ${connectionId}`);

    // 发送欢迎消息
    this.sendWelcomeMessage(connection);

    // 设置消息监听器
    this.setupMessageListeners(connection);

    // 设置连接事件监听器
    this.setupConnectionListeners(connection);

    // 启动心跳机制
    this.startHeartbeat(projectKey);
  }

  /**
   * 添加连接到映射
   */
  private addConnection(projectKey: string, connection: WebSocketConnection): void {
    if (!this.connections.has(projectKey)) {
      this.connections.set(projectKey, []);
    }
    this.connections.get(projectKey)!.push(connection);
    this.logger.info(`项目 ${projectKey} 当前连接数: ${this.connections.get(projectKey)!.length}`);
  }

  /**
   * 从映射中移除连接
   */
  private removeConnection(projectKey: string, connectionId: string): void {
    const connections = this.connections.get(projectKey);
    if (connections) {
      const index = connections.findIndex(conn => conn.id === connectionId);
      if (index !== -1) {
        connections.splice(index, 1);
        this.logger.info(`移除连接 ${connectionId}，项目 ${projectKey} 剩余连接数: ${connections.length}`);

        // 如果没有连接了，清理心跳和映射
        if (connections.length === 0) {
          this.cleanupProject(projectKey);
        }
      }
    }
  }

  /**
   * 清理项目相关资源
   */
  private cleanupProject(projectKey: string): void {
    // 清理心跳定时器
    const heartbeatInterval = this.heartbeatIntervals.get(projectKey);
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      this.heartbeatIntervals.delete(projectKey);
    }

    // 移除连接映射
    this.connections.delete(projectKey);
    this.logger.info(`清理项目 ${projectKey} 的所有资源`);
  }

  /**
   * 生成唯一连接ID
   */
  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 发送欢迎消息
   */
  private sendWelcomeMessage(connection: WebSocketConnection): void {
    const message: PushMessage = {
      event: 'welcome',
      content: 'WebSocket推送连接已建立',
      timestamp: new Date().toISOString()
    };

    this.sendToConnection(connection, message);
  }

  /**
   * 设置消息监听器
   */
  private setupMessageListeners(connection: WebSocketConnection): void {
    connection.websocket.on('message', (message: any) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type !== 'ping' && data.type !== 'pong') {
          this.logger.info(`收到推送连接消息，项目: ${connection.projectKey}, 连接: ${connection.id}`, data);
        }

        // 处理ping消息
        if (data.type === 'ping') {
          connection.lastHeartbeat = new Date();
          this.sendToConnection(connection, {
            event: 'pong',
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        this.logger.error(`推送连接消息解析错误，项目: ${connection.projectKey}, 连接: ${connection.id}`, error);
      }
    });
  }

  /**
   * 设置连接事件监听器
   */
  private setupConnectionListeners(connection: WebSocketConnection): void {
    connection.websocket.on('close', () => {
      this.logger.info(`WebSocket推送连接关闭，项目: ${connection.projectKey}, 连接: ${connection.id}`);
      this.removeConnection(connection.projectKey, connection.id);
    });

    connection.websocket.on('error', (error: any) => {
      this.logger.error(`WebSocket推送连接错误，项目: ${connection.projectKey}, 连接: ${connection.id}`, error);
      this.removeConnection(connection.projectKey, connection.id);
    });
  }

  /**
   * 启动心跳机制
   */
  private startHeartbeat(projectKey: string): void {
    // 如果已经有心跳定时器，先清理
    const existingInterval = this.heartbeatIntervals.get(projectKey);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    // 创建新的心跳定时器
    const heartbeatInterval = setInterval(() => {
      this.sendHeartbeat(projectKey);
    }, 30000); // 每30秒发送一次心跳

    this.heartbeatIntervals.set(projectKey, heartbeatInterval);
    // this.logger.info(`启动项目 ${projectKey} 的心跳机制`);
  }

  /**
   * 发送心跳消息
   */
  private sendHeartbeat(projectKey: string): void {
    const connections = this.connections.get(projectKey);
    if (connections && connections.length > 0) {
      const heartbeatMessage: PushMessage = {
        event: 'heartbeat',
        content: 'heartbeat',
        timestamp: new Date().toISOString()
      };

      // 向所有连接发送心跳
      connections.forEach(connection => {
        this.sendToConnection(connection, heartbeatMessage);
      });

      this.logger.debug(`向项目 ${projectKey} 的 ${connections.length} 个连接发送心跳`);
    }
  }

  /**
   * 向指定连接发送消息
   */
  private sendToConnection(connection: WebSocketConnection, message: PushMessage): void {
    try {
      if (connection.websocket.readyState === 1) { // WebSocket.OPEN
        connection.websocket.send(JSON.stringify(message));
      } else {
        this.logger.warn(`连接 ${connection.id} 状态异常，准备移除`);
        this.removeConnection(connection.projectKey, connection.id);
      }
    } catch (error) {
      this.logger.error(`发送消息到连接 ${connection.id} 失败`, error);
      this.removeConnection(connection.projectKey, connection.id);
    }
  }

  /**
   * 静态API：向指定项目的所有连接推送消息
   * @param projectKey 项目键
   * @param sseData SSE数据
   */
  public static pushToProject(projectKey: string, sseData: any): void {
    const instance = ProjectPushWs.getInstance();
    const connections = instance.connections.get(projectKey);

    if (!connections || connections.length === 0) {
      instance.logger.debug(`项目 ${projectKey} 没有活跃的推送连接`);
      return;
    }

    const pushMessage: PushMessage = {
      event: sseData.event,
      content: sseData.content,
      data: sseData.data,
      conversationId: sseData.conversationId,
      messageId: sseData.messageId,
      timestamp: new Date().toISOString()
    };

    // 向所有连接推送消息
    connections.forEach(connection => {
      instance.sendToConnection(connection, pushMessage);
    });

    instance.logger.info(`向项目 ${projectKey} 的 ${connections.length} 个连接推送消息: ${sseData.event}`);
  }

  /**
   * 静态API：获取项目的连接统计信息
   * @param projectKey 项目键
   */
  public static getProjectStats(projectKey?: string): any {
    const instance = ProjectPushWs.getInstance();

    if (projectKey) {
      const connections = instance.connections.get(projectKey) || [];
      return {
        projectKey,
        connectionCount: connections.length,
        connections: connections.map(conn => ({
          id: conn.id,
          connectedAt: conn.connectedAt,
          lastHeartbeat: conn.lastHeartbeat
        }))
      };
    } else {
      // 返回所有项目的统计信息
      const stats: any = {};
      instance.connections.forEach((connections, key) => {
        stats[key] = {
          connectionCount: connections.length,
          connections: connections.map(conn => ({
            id: conn.id,
            connectedAt: conn.connectedAt,
            lastHeartbeat: conn.lastHeartbeat
          }))
        };
      });
      return stats;
    }
  }

  /**
   * 静态API：清理所有连接（用于服务器关闭时）
   */
  public static cleanupAll(): void {
    const instance = ProjectPushWs.getInstance();

    // 清理所有心跳定时器
    instance.heartbeatIntervals.forEach((interval, projectKey) => {
      clearInterval(interval);
      instance.logger.info(`清理项目 ${projectKey} 的心跳定时器`);
    });

    // 关闭所有连接
    instance.connections.forEach((connections, projectKey) => {
      connections.forEach(connection => {
        try {
          connection.websocket.close(1000, 'Server shutdown');
        } catch (error) {
          instance.logger.error(`关闭连接 ${connection.id} 时出错`, error);
        }
      });
      instance.logger.info(`关闭项目 ${projectKey} 的所有连接`);
    });

    // 清空映射
    instance.connections.clear();
    instance.heartbeatIntervals.clear();
    instance.logger.info('清理所有WebSocket推送连接');
  }
}
