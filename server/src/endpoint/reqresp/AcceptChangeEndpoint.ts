import { ConversationService } from "../../crud/ConversationService";
import { ProjectService } from "../../crud/ProjectService";
import { HttpCtx } from "../../http/HttpCtx";
import { Logger } from "../../helper/logger";
import { ReqRespEndpoint } from "../../http/HttpEndpoint";

export interface AcceptChangeRequest {
  projectKey: string;
  conversationId: string;
}

export class AcceptChangeEndpoint {
  public static async handle(
    httpCtx: HttpCtx,
    request: any
  ) {
    let detailRequest = request.body as AcceptChangeRequest;

    let project = await ProjectService.detail(detailRequest.projectKey);
    if (!project) {
      httpCtx.responseError(1, "project not found", null);
      return;
    }

    let conversationResult = await ConversationService.detail(detailRequest.conversationId);
    if (!conversationResult) {
      httpCtx.responseError(1, "conversation not found", null);
      return;
    }

    let dslSnapshotAfterId = conversationResult.dslSnapshotAfterId;
    if (dslSnapshotAfterId) {
      await ConversationService.updateConversationBaseSnapshotId(detailRequest.conversationId, dslSnapshotAfterId);
      await ProjectService.updateSnapshotId(project, dslSnapshotAfterId);
    }

    let projectVo = await ProjectService.makeDetailVo(project);

    httpCtx.responseOk(projectVo);
  }
}