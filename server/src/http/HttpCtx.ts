import { Logger } from "../helper/logger";

export interface HttpCtx {
  logger: Logger;
  // 非流式输出相关 start
  response(httpStatus: number, body: any): void;
  responseOk(body: any): void;
  responseError(bizErrorCode: number, errorMessage: string, body: any): void;
  // 非流式输出相关 end

  // 流式输出相关 start
  emitErrorAndEnd: (error: string) => void;
  emitData: (data: string) => void;
  emitDoneAndEnd: () => void;
  // 流式输出相关 end
}