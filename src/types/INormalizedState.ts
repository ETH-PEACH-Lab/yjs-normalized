export type ByIdState<T> = Record<string, T>;
export interface INormalizedState<T> {
  byId: ByIdState<T>;
  allIds: string[];
}
