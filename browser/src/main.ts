
import { AiWebArchitectMesh } from './actor/mesh/AiWebArchitectMesh';
import { TechDocEditorActorLogic } from './actor/editor/logic/TechDocEditorActorLogic';
import { TechDocAIAgentActorLogic } from './actor/aiagent/logic/TechDocAIAgentActorLogic';


let mesh = new AiWebArchitectMesh();

mesh.TechDocEditorActorApi = new TechDocEditorActorLogic(mesh);
await mesh.TechDocEditorActorApi.connect();

mesh.TechDocAIAgentActorApi = new TechDocAIAgentActorLogic(mesh);
await mesh.TechDocAIAgentActorApi.connect();
