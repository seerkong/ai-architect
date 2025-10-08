import { BaseSSEHandler } from "./BaseSSEHandler";
import { ModuleDesignSSEHandler } from "./ModuleDesignSSEHandler";
import { AiAgentMode } from "@shared/contract";
import { TechDocAIAgentRuntime } from "../../contract/TechDocAIAgentRuntime";
import { AiWebArchitectMesh } from "../../../mesh/AiWebArchitectMesh";
import { TechDocAIAgentActorLogic } from "../TechDocAIAgentActorLogic";
import { ResetInputAndInitModulesSSEHandler } from "./ResetInputAndInitModulesSSEHandler";

/**
 * SSE处理器工厂类
 * 根据不同的AI代理模式创建对应的SSE处理器
 */
export class SSEHandlerFactory {

  /**
   * 根据AI代理模式创建对应的SSE处理器
   */
  public static createHandler(
    mode: AiAgentMode,
    mesh: AiWebArchitectMesh,
    runtime: TechDocAIAgentRuntime,
    publicLogic: TechDocAIAgentActorLogic
  ): BaseSSEHandler {
    switch (mode) {
      case AiAgentMode.ResetInputAndInitModules:
        return new ResetInputAndInitModulesSSEHandler(mesh, runtime, publicLogic);
      case AiAgentMode.ModuleDesign:
        return new ModuleDesignSSEHandler(mesh, runtime, publicLogic);
      default:
        throw new Error(`不支持的AI代理模式: ${mode}`);
    }
  }

  /**
   * 获取所有支持的模式
   */
  public static getSupportedModes(): AiAgentMode[] {
    return [
      AiAgentMode.ResetInputAndInitModules,
      AiAgentMode.ModuleDesign,
    ];
  }
}
