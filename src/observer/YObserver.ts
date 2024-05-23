import type * as Y from 'yjs';
export abstract class YObserver {
  protected _unobserve: () => void = () => {};
  abstract dispose: () => void;
  protected abstract dispatch: (event: Y.YMapEvent<any>) => void;
}
