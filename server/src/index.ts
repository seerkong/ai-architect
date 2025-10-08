import 'reflect-metadata';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from 'koa-cors';
import Router from 'koa-router';
import serve from 'koa-static';
import path from 'path';
const websockify = require('koa-websocket');

import { KoaHttpCtx } from './http/KoaConnHolder';
import { AcceptChangeEndpoint } from './endpoint/reqresp/AcceptChangeEndpoint';
import { ModuleDesignEndpoint } from './endpoint/sse/ModuleDesignEndpoint';
import { ProjectDetailEndpoint } from './endpoint/reqresp/ProjectDetailEndpoint';
import { ProjectUpsertEndpoint } from './endpoint/reqresp/ProjectUpsertEndpoint';
import { logger } from './helper/logger';
import { ProjectPushWs } from './endpoint/ws/ProjectPushWs';
import { ResetInputAndInitModulesEndpoint } from './endpoint/sse/ResetInputAndInitModulesEndpoint';
import { FetchDocContentEndpoint } from './endpoint/reqresp/FetchDocContentEndpoint';
import { UpdateTechDocDslEndpoint } from './endpoint/reqresp/UpdateTechDocDslEndpoint';
import { configManager } from './config';
import { initializeDatabase } from './entity/typeorm-config';
import { API_URL_FETCH_DOC_CONTENT, API_URL_PROJECT_ACCEPT_CHANGES, API_URL_PROJECT_DETAIL, API_URL_PROJECT_UPSERT, API_URL_UPDATE_TECH_DOC_DSL, SSE_URL_MODULE_DESIGN, SSE_URL_RESET_INPUT_AND_INIT_MODULES } from '../../shared/contract/api';
import { ReqRespEndpoint } from './http/HttpEndpoint';
import { HealthResponse } from '@shared/contract';

const app = websockify(new Koa());
const router = new Router();

// 中间件配置
const corsConfig = configManager.getCorsConfig();
app.use(cors({
  origin: corsConfig.origin,
}));

app.use(bodyParser());

// 错误处理中间件
app.use(async (ctx: any, next: any) => {
  try {
    await next();
  } catch (err: any) {
    logger.error('Server error:', err);
    ctx.status = err.status || 500;
    ctx.body = {
      error: 'Internal Server Error',
      message: configManager.getServerConfig().node_env === 'development' ? err.message : 'Something went wrong'
    };
  }
});

// 日志中间件
app.use(async (ctx: any, next: any) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  logger.info(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// API路由
router.get('/api/health', async (ctx) => {
  const healthResponse: HealthResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  };
  ctx.body = healthResponse;
});

// WebSocket连接统计API
router.get('/api/ws/stats', async (ctx) => {
  const projectKey = ctx.query['projectKey'] as string;
  const stats = ProjectPushWs.getProjectStats(projectKey);
  ctx.body = {
    success: true,
    data: stats,
    timestamp: new Date().toISOString()
  };
});

const ssePostEndpoints: { [key: string]: ReqRespEndpoint } = {}
ssePostEndpoints[SSE_URL_RESET_INPUT_AND_INIT_MODULES] = new ResetInputAndInitModulesEndpoint(logger);
ssePostEndpoints[SSE_URL_MODULE_DESIGN] = new ModuleDesignEndpoint(logger);

const noSSEPostEndpoints: { [key: string]: ReqRespEndpoint } = {}
noSSEPostEndpoints[API_URL_PROJECT_UPSERT] = new ProjectUpsertEndpoint(logger);
noSSEPostEndpoints[API_URL_PROJECT_DETAIL] = new ProjectDetailEndpoint(logger);
noSSEPostEndpoints[API_URL_PROJECT_ACCEPT_CHANGES] = new AcceptChangeEndpoint(logger);
noSSEPostEndpoints[API_URL_FETCH_DOC_CONTENT] = new FetchDocContentEndpoint(logger);
noSSEPostEndpoints[API_URL_UPDATE_TECH_DOC_DSL] = new UpdateTechDocDslEndpoint(logger);


// 流式响应post接口
for (const [path, endpoint] of Object.entries(ssePostEndpoints)) {
  router.post(path, async (ctx) => {
    ctx.status = 200;
    ctx.set('Content-Type', 'text/event-stream');
    ctx.set('Cache-Control', 'no-cache');
    ctx.set('Connection', 'keep-alive');
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Headers', 'Content-Type');
    // 禁用缓冲，确保流式输出的实时性
    ctx.set('X-Accel-Buffering', 'no'); // 禁用Nginx缓冲
    ctx.set('Transfer-Encoding', 'chunked');
    const httpCtx = new KoaHttpCtx(ctx);
    try {
      await endpoint.handle(httpCtx, ctx.request);
    } catch (error: any) {
      logger.error('SSE error:', error);
      ctx.res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      ctx.res.end();
    }
  });
}

// 普通post接口
for (const [path, endpoint] of Object.entries(noSSEPostEndpoints)) {
  router.post(path, async (ctx) => {
    const httpCtx = new KoaHttpCtx(ctx);
    try {
      await endpoint.handle(httpCtx, ctx.request);
    } catch (error: any) {
      logger.error('post API error:', error);
      httpCtx.response(500, {
        error: 'Failed to process request',
        details: configManager.getServerConfig().node_env === 'development' ? error.message : 'Internal server error'
      })
    }
  });
}
// WebSocket端点实例
const projectPushWs = ProjectPushWs.getInstance();

// WebSocket路由 - 项目推送端点
app.ws.use((ctx: any, next: any) => {
  if (ctx.path.startsWith('/ws/push/')) {
    const projectKey = ctx.path.replace('/ws/push/', '');
    if (projectKey) {
      ctx.params = { projectKey };
      projectPushWs.handleConnection(ctx);
    } else {
      ctx.websocket.close(1000, 'Missing projectKey');
    }
  } else {
    return next();
  }
});

// 应用路由
app.use(router.routes());
app.use(router.allowedMethods());

// 静态文件服务 - 服务public目录（放在API路由之后）
app.use(serve(path.join(__dirname, '../../public')));

// 启动服务器
const serverConfig = configManager.getServerConfig();
const PORT = serverConfig.port;
const HOST = serverConfig.host;

// 初始化数据库连接
async function startServer() {
  try {
    await initializeDatabase();
    logger.info('✅ TypeORM 数据库连接已建立');

    const server = app.listen(PORT, HOST, () => {
      logger.info(`🚀 Server running on http://${HOST}:${PORT}`);
      logger.info(`📁 Static files served from: ${path.join(__dirname, '../../public')}`);
      logger.info(`📡 WebSocket Push available at: ws://${HOST}:${PORT}/ws/push/{projectKey}`);
      logger.info(`📊 Health check: http://${HOST}:${PORT}/api/health`);
    });

    return server;
  } catch (error) {
    logger.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
}

// 启动服务器
startServer().catch((error) => {
  logger.error('❌ 服务器启动失败:', error);
  process.exit(1);
});

export default app;
