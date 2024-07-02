import type * as Y from 'yjs';
export class AllIdsObserver {
  constructor(
    allIds: Y.Array<string>,
    allIdsDispatcher: (payload: string[]) => void,
  ) {
    this._allIdsDispatcher = allIdsDispatcher;
    allIds.observe(this.dispatch.bind(this));
    this._unobserve = () => {
      allIds.unobserve(this.dispatch);
    };
  }

  private readonly dispatch: (event: Y.YArrayEvent<any>) => void = (
    event: Y.YArrayEvent<any>,
  ) => {
    if (
      event.delta[0].delete === event.target.length &&
      Array.isArray(event.delta[1].insert) &&
      event.delta[1].insert.length === event.target.length
    ) {
      console.log('Swap occurred');
      this._allIdsDispatcher(event.target.toArray() as string[]);
    }
  };

  public dispose: () => void = () => {
    try {
      this._unobserve();
    } catch {
      console.debug('AllIdsObserver already disposed');
    }
  };

  private readonly _unobserve: () => void;
  protected _allIdsDispatcher: (payload: string[]) => void;
}
