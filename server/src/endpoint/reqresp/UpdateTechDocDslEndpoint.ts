import { ConversationEntityType, ProjectEntityType, UpdateTechDocDslRequest } from "../../../../shared/contract";
import { ConversationService } from "../../crud/ConversationService";
import { ProjectService } from "../../crud/ProjectService";
import { SnapshotService } from "../../crud/SnapshotService";
import { HttpCtx } from "../../http/HttpCtx";
import { Logger } from "../../helper/logger";
import { ReqRespEndpoint } from "../../http/HttpEndpoint";

export class UpdateTechDocDslEndpoint implements ReqRespEndpoint {
  constructor(
    private logger: Logger) { }

  public async handle(
    httpCtx: HttpCtx,
    request: any
  ) {
    let typedRequest = request.body as UpdateTechDocDslRequest;

    if (typedRequest.techDocDsl == null) {
      httpCtx.responseError(1, '不合法的techDocDsl', null);
    }

    let project = await ProjectService.findOne(typedRequest.projectKey) as ProjectEntityType | null;
    if (!project) {
      httpCtx.responseError(1, 'project not found', null);
      return;
    }

    // 创建新的snapshot
    let newSnapshotId = await SnapshotService.createSnapshot(typedRequest.projectKey, typedRequest.techDocDsl);

    if (newSnapshotId <= 0) {
      httpCtx.responseError(1, '创建新的snapshot失败', null);
      return;
    }

    // 如果传入了会话id, 则更新到会话级的after state
    if (typedRequest.conversationUniqueId
      && typedRequest.conversationUniqueId.trim().length > 0
    ) {
      let conversation = await ConversationService.findOneByUniqueId(typedRequest.conversationUniqueId) as ConversationEntityType | null;
      if (!conversation) {
        httpCtx.responseError(1, 'conversation not found', null);
        return;
      }

      // 更新到 conversation的 dslSnapshotAfterId
      await ConversationService.updateAfterSnapshotId(typedRequest.conversationUniqueId, newSnapshotId);
    } else {
      // 更新到 project 的 dslSnapshotId
      await ProjectService.updateSnapshotId(project, newSnapshotId);
    }

    httpCtx.responseOk({
      newSnapshotId: newSnapshotId,
    });
  }
}