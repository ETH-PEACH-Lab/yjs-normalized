import type * as Y from 'yjs';
import { ByIdObserver } from './ByIdObserver';
import { YObserver } from './YObserver';
import { AllIdsObserver } from './AllIdsObserver';
import { type INormalizedState } from '../types/INormalizedState';
import {
  type AddDispatch,
  type AllIdsDispatch,
  type DeleteDispatch,
  type RootDispatch,
  type UpdatePropertyDispatch,
} from '../types';

export abstract class RootObserver<T> extends YObserver {
  dispose: () => void = () => {
    this._unobserve();
    this._byIdObserver?.dispose();
  };

  constructor(data: Y.Map<any>, documentIdentifier?: string) {
    super(documentIdentifier);
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
          (payload: T) => {
            this.addDispatcher({
              item: payload,
              documentIdentifier: this.documentIdentifier,
            });
          },
          (payload: string) => {
            this.deleteDispatcher({
              id: payload,
              documentIdentifier: this.documentIdentifier,
            });
          },
          (payload: { id: string; key: string; value: any }) => {
            this.updatePropertyDispatcher({
              ...payload,
              documentIdentifier: this.documentIdentifier,
            });
          },
        );
      }
      if (
        (event.target.get('allIds') as Y.Array<string>) &&
        this._allIdsObserver === undefined
      ) {
        this._allIdsObserver = new AllIdsObserver(
          event.target.get('allIds') as Y.Array<string>,
          (payload: string[]) => {
            this.allIdsDispatcher({
              ids: payload,
              documentIdentifier: this.documentIdentifier,
            });
          },
        );
      }
      this.rootDispatcher({
        state: structuredClone(event.target.toJSON()) as INormalizedState<T>,
        documentIdentifier: this.documentIdentifier,
      });
    }
  };

  protected abstract rootDispatcher: (payload: RootDispatch<T>) => void;
  protected abstract addDispatcher: (payload: AddDispatch<T>) => void;
  protected abstract deleteDispatcher: (payload: DeleteDispatch) => void;
  protected abstract updatePropertyDispatcher: (
    payload: UpdatePropertyDispatch,
  ) => void;

  protected abstract allIdsDispatcher: (payload: AllIdsDispatch) => void;

  private _byIdObserver: ByIdObserver<T> | undefined;
  private _allIdsObserver: AllIdsObserver | undefined;
}
