import { Logger } from "../../helper/logger";
import { HttpCtx } from "../../http/HttpCtx";
import { ProjectService } from "../../crud/ProjectService";
import { ReqRespEndpoint } from "../../http/HttpEndpoint";

export interface ProjectUpsertRequest {
  projectKey: string;
}

export class ProjectUpsertEndpoint {
  public static async handle(
    httpCtx: HttpCtx,
    request: any
  ) {
    let upsertRequest = request.body as ProjectUpsertRequest;

    let projectResult = await ProjectService.upsert(upsertRequest.projectKey);
    httpCtx.responseOk(projectResult);
  }
}