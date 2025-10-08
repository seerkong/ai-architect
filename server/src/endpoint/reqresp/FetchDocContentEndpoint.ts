import { convertMarkdownToHtml, getDocsContentByLink } from "../../helper/DocsApiHelper";
import { HttpCtx } from "../../http/HttpCtx";
import { Logger } from "../../helper/logger";
import { ReqRespEndpoint } from "../../http/HttpEndpoint";
import { FetchDocContentRequest, FetchDocContentResponse } from "@shared/contract";


export class FetchDocContentEndpoint implements ReqRespEndpoint {
  constructor(
    private logger: Logger) { }

  public async handle(
    httpCtx: HttpCtx,
    request: any
  ) {
    let typedRequest = request.body as FetchDocContentRequest;

    let markdownContent = await getDocsContentByLink(typedRequest.docLink);
    let htmlContent = convertMarkdownToHtml(markdownContent);

    httpCtx.responseOk({
      markdownContent: markdownContent,
      htmlContent: htmlContent
    } as FetchDocContentResponse);
  }
}
