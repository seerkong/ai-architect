import { HttpCtx } from "./HttpCtx";

export interface ReqRespEndpoint {
  handle(httpCtx: HttpCtx, request: any): Promise<void>;
}
