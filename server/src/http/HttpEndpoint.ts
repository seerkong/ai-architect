import { HttpCtx } from "./HttpCtx";

export type ReqRespEndpoint = (httpCtx: HttpCtx, request: any) => Promise<void>;
