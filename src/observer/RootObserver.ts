import type * as Y from 'yjs';
import { ByIdObserver } from './ByIdObserver';
import { YObserver } from './YObserver';
import { AllIdsObserver } from './AllIdsObserver';
import { type INormalizedState } from '../types/INormalizedState';

export abstract class RootObserver<T> extends YObserver {
  dispose: () => void = () => {
    this._unobserve();
    this._byIdObserver?.dispose();
  };

  constructor(data: Y.Map<any>) {
    super();

    data.observe(this.dispatch.bind(this));
    this._unobserve = () => {
      data.unobserve(this.dispatch);
    };
  }

  protected dispatch: (event: Y.YMapEvent<any>) => void = (
    event: Y.YMapEvent<any>,
  ) => {
    if (event.path.length === 0) {
      if (
        (event.target.get('byId') as Y.Map<any>) &&
        this._byIdObserver === undefined
      ) {
        this._byIdObserver = new ByIdObserver<T>(
          event.target.get('byId') as Y.Map<any>,
          this.addDispatcher,
          this.deleteDispatcher,
          this.updatePropertyDispatcher,
        );
      }
      if (
        (event.target.get('allIds') as Y.Array<string>) &&
        this._allIdsObserver === undefined
      ) {
        this._allIdsObserver = new AllIdsObserver(
          event.target.get('allIds') as Y.Array<string>,
          this.allIdsDispatcher,
        );
      }
      this.rootDispatcher(
        structuredClone(event.target.toJSON()) as INormalizedState<T>,
      );
    }
  };

  protected abstract rootDispatcher: (payload: INormalizedState<T>) => void;
  protected abstract addDispatcher: (payload: T) => void;
  protected abstract deleteDispatcher: (payload: string) => void;
  protected abstract updatePropertyDispatcher: (payload: {
    id: string;
    key: string;
    value: any;
  }) => void;

  protected abstract allIdsDispatcher: (payload: string[]) => void;

  private _byIdObserver: ByIdObserver<T> | undefined;
  private _allIdsObserver: AllIdsObserver | undefined;
}
