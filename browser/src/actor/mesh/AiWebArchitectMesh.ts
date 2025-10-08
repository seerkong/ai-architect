import { TechDocAIAgentActorApi } from "../aiagent/contract/TechDocAiAgentActorApi";
import { TechDocEditorActorApi } from "../editor/contract/TechDocEditorActorApi";

export class AiWebArchitectMesh {
  constructor() {
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