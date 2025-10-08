import { HttpCtx } from "./HttpCtx";

export class KoaHttpCtx implements HttpCtx {
  constructor(private ctx: any) { }

  public response(httpStatus: number, body: any): void {
    this.ctx.status = httpStatus;
    this.ctx.body = body;
  }

  public responseOk(body: any): void {
    // this.ctx.status = 200;
    this.ctx.body = {
      code: 0,
      data: body
    };
  }

  responseError(bizErrorCode: number, errorMessage: string, body: any): void {
    this.ctx.body = {
      code: bizErrorCode,
      message: errorMessage,
      data: body
    };
  }

  public emitErrorAndEnd(error: string) {
    this.ctx.res.write(`data: ${error}\n\n`);
    this.ctx.res.end();
  }

  public emitData(data: string) {
    this.ctx.res.write(`data: ${data}\n\n`);
    // 立即flush数据到客户端，确保流式输出的实时性
    if (this.ctx.res.flush) {
      this.ctx.res.flush();
    }
  }

  public emitDoneAndEnd() {
    // this.ctx.res.write(`data: [DONE]\n\n`);
    this.ctx.res.end();

    // 防止Koa自动结束响应
    this.ctx.respond = false;
  }
}