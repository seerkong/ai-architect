import { TechDocAIAgentActorApi } from "../aiagent/contract/TechDocAiAgentActorApi";
import { TechDocEditorActorApi } from "../editor/contract/TechDocEditorActorApi";
import { LayoutActorApi } from "../layout/LayoutActorApi";

export class AiWebArchitectMesh {
  constructor() {
  }

  private _LayoutActorApi: LayoutActorApi | undefined;

  public get LayoutActorApi(): LayoutActorApi {
    return this._LayoutActorApi as LayoutActorApi;
  }
  public set LayoutActorApi(value: LayoutActorApi) {
    this._LayoutActorApi = value;
  }

  private _TechDocEditorActorApi: TechDocEditorActorApi | undefined;

  public get TechDocEditorActorApi(): TechDocEditorActorApi {
    return this._TechDocEditorActorApi as TechDocEditorActorApi;
  }
  public set TechDocEditorActorApi(value: TechDocEditorActorApi) {
    this._TechDocEditorActorApi = value;
  }

  private _TechDocAIAgentActorApi: TechDocAIAgentActorApi | undefined;
  public get TechDocAIAgentActorApi(): TechDocAIAgentActorApi {
    return this._TechDocAIAgentActorApi as TechDocAIAgentActorApi;
  }
  public set TechDocAIAgentActorApi(value: TechDocAIAgentActorApi) {
    this._TechDocAIAgentActorApi = value;
  }

}