import { YObserver } from './YObserver';
import type * as Y from 'yjs';

export class ObjectObserver extends YObserver {
  constructor(
    object: Y.Map<any>,
    updatePropertyDispatcher: (payload: {
      id: string;
      key: string;
      value: any;
    }) => void,
    documentIdentifier?: string,
  ) {
    super(documentIdentifier);
    object.observe(this.dispatch.bind(this));
    this._unobserve = () => {
      object.unobserve(this.dispatch);
    };
    this._updatePropertyDispatcher = updatePropertyDispatcher;
  }

  dispose: () => void = () => {
    this._unobserve();
  };

  protected dispatch: (event: Y.YMapEvent<any>) => void = (
    event: Y.YMapEvent<any>,
  ) => {
    if (event.path.length === 0 && event.keys.size > 0) {
      event.keys.forEach((value, key) => {
        if (value.action === 'update') {
          this._updatePropertyDispatcher({
            id: event.target.get('id'),
            key,
            value: event.target.get(key),
          });
        }
      });
    }
  };

  protected _updatePropertyDispatcher: (payload: {
    id: string;
    key: string;
    value: any;
  }) => void;
}
