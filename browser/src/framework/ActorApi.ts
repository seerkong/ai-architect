export interface ActorApi<T = any> {
  mount(): Promise<void>;
  connect(): Promise<void>;
}