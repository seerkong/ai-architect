import { TechDesignSnapshotDsl } from "../contract/dsl/TechDesignDslDef";

export const EmptyDesignDsl: TechDesignSnapshotDsl = {
  "Module": {},
  "Enum": {},
  "Entity": {},
  "HttpEndpoint": {},
  "KafkaConsumer": {},
  "PublicProcedure": {},
  "PrivateProcedure": {},
  "StateMachine": {},
  "BackendCache": {},
  "BusinessFlow": {},
} as unknown as TechDesignSnapshotDsl