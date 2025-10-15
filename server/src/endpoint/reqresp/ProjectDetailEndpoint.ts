import { ProjectService } from "../../crud/ProjectService";
import { HttpCtx } from "../../http/HttpCtx";
import { Logger } from "../../helper/logger";
import { ReqRespEndpoint } from "../../http/HttpEndpoint";
import { ProjectEntityType } from "@shared/contract";

export interface ProjectDetailRequest {
  projectKey: string;
}

export class ProjectDetailEndpoint {
  public static async handle(
    httpCtx: HttpCtx,
    request: any
  ) {
    let detailRequest = request.body as ProjectDetailRequest;

    let project = await ProjectService.detail(detailRequest.projectKey);
    if (!project) {
      httpCtx.responseError(1, "project not found", null);
      return;
    }
    let projectVo = await ProjectService.makeDetailVo(project as unknown as ProjectEntityType);
    httpCtx.responseOk(projectVo);
  }
}