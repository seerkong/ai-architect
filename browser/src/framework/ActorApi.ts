export interface ActorApi<T = any> {
  // init(): T;
  connect(): Promise<void>;
}