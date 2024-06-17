import type * as Y from 'yjs';
export abstract class YObserver {
  protected constructor(documentIdentifier?: string) {
    this.documentIdentifier = documentIdentifier;
  }

  protected documentIdentifier?: string;
  protected _unobserve: () => void = () => {};
  abstract dispose: () => void;
  protected abstract dispatch: (event: Y.YMapEvent<any>) => void;
}
