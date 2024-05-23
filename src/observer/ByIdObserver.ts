import type * as Y from 'yjs';
import { YObserver } from './YObserver';
import { ObjectObserver } from './ObjectObserver';
export class ByIdObserver<T> extends YObserver {
  constructor(
    byId: Y.Map<any>,
    addDispatcher: (payload: T) => void,
    deleteDispatcher: (payload: string) => void,
    updatePropertyDispatcher: (payload: {
      id: string;
      key: string;
      value: any;
    }) => void,
  ) {
    super();
    byId.observe(this.dispatch.bind(this));
    this._unobserve = () => {
      byId.unobserve(this.dispatch);
    };
    this._addDispatcher = addDispatcher;
    this._deleteDispatcher = deleteDispatcher;
    this._updatePropertyDispatcher = updatePropertyDispatcher;

    byId.forEach((value, key) => {
      this._objectObservers.set(
        key,
        new ObjectObserver(value as Y.Map<any>, this._updatePropertyDispatcher),
      );
    });
  }

  dispose: () => void = () => {
    this._unobserve();
    this._objectObservers.forEach((observer) => {
      observer.dispose();
    });
  };

  protected dispatch: (event: Y.YMapEvent<any>) => void = (
    event: Y.YMapEvent<any>,
  ) => {
    if (event.path.length === 0 && event.keys.size > 0) {
      event.keys.forEach((value, key) => {
        if (value.action === 'add') {
          this._addDispatcher(
            structuredClone(event.target.get(key).toJSON()) as T,
          );
          this._objectObservers.set(
            key,
            new ObjectObserver(
              event.target.get(key) as Y.Map<any>,
              this._updatePropertyDispatcher,
            ),
          );
        } else if (value.action === 'delete') {
          this._deleteDispatcher(key);
          this._objectObservers.delete(key);
        }
      });
    }
  };

  protected _addDispatcher: (payload: T) => void;
  protected _deleteDispatcher: (payload: string) => void;
  protected _updatePropertyDispatcher: (payload: {
    id: string;
    key: string;
    value: any;
  }) => void;

  private readonly _objectObservers = new Map<string, ObjectObserver>();
}
