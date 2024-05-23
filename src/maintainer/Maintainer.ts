import * as Y from 'yjs';

export class Maintainer<T extends { id: string }> {
  constructor(objects: Y.Map<any>, transact: (fn: () => void) => void) {
    this._transact = transact;
    this._objects = objects;
  }

  addObject(object: T): void {
    this._transact(() => {
      this.byId.set(object.id, new Y.Map(Object.entries(object)));
      this.allIds.push([object.id]);
    });
  }

  deleteObject(
    id: string,
    onCascade?: (key: string, value: string) => void,
  ): void {
    this._transact(() => {
      const tempObject = this.getObjectAsJson(id);
      if (tempObject === undefined) return;
      if (this.byId.has(id)) {
        this.byId.delete(id);
        this.allIds.delete(this.getArrayIndex(id), 1);
      }
      if (onCascade !== undefined) {
        Object.entries(tempObject).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((entry: string) => {
              onCascade(key, entry);
            });
          } else {
            onCascade(key, value);
          }
        });
      }
    });
  }

  changeObject(object: T): void {
    const tempObject = this.getObject(object.id);
    if (tempObject === undefined) return;
    this._transact(() => {
      Object.entries(object).forEach(([key, value]) => {
        if (tempObject.get(key) !== value) {
          tempObject.set(key, value);
        }
      });
    });
  }

  swapObjectPosition(fromIndex: number, toIndex: number): void {
    if (fromIndex === toIndex) return;
    if (toIndex < 0 || toIndex > this.allIds.length - 1) return;
    const array = this.allIds.toArray();
    const element = array[fromIndex];
    array.splice(fromIndex, 1);
    array.splice(toIndex, 0, element);
    this._transact(() => {
      this.allIds.delete(0, this.allIds.length);
      this.allIds.push(array);
    });
  }

  addToPropertyArray(
    objectId: string,
    property: string,
    referenceId: string,
  ): void {
    const tempObject = this.getObject(objectId);
    if (tempObject === undefined) return;
    tempObject.set(property, [...tempObject.get(property), referenceId]);
  }

  removeFromPropertyArray(
    objectId: string,
    property: string,
    referenceId: string,
    onCascade?: () => void,
  ): void {
    const tempObject = this.getObject(objectId);
    if (tempObject === undefined) return;
    this._transact(() => {
      tempObject.set(
        property,
        (tempObject.get(property) as string[]).filter(
          (id) => id !== referenceId,
        ),
      );
      onCascade?.();
    });
  }

  swapInPropertyArray(
    objectId: string,
    property: string,
    fromIndex: number,
    toIndex: number,
  ): void {
    const tempObject = this.getObject(objectId);
    if (tempObject === undefined) return;
    const array = structuredClone(tempObject.get(property)) as string[];
    if (fromIndex === toIndex) return;
    if (toIndex < 0 || toIndex > array.length - 1) return;

    const element = array[fromIndex];
    array.splice(fromIndex, 1);
    array.splice(toIndex, 0, element);
    tempObject.set(property, array);
  }

  getObject(id: string): Y.Map<any> | undefined {
    return this.byId.get(id);
  }

  getObjectAsJson(id: string): T | undefined {
    return structuredClone(this.getObject(id)?.toJSON()) as T;
  }

  private get byId(): Y.Map<any> {
    return this._objects.get('byId') as Y.Map<any>;
  }

  private get allIds(): Y.Array<string> {
    return this._objects.get('allIds') as Y.Array<string>;
  }

  protected getArrayIndex(id: string): number {
    return (this._objects.get('allIds') as Y.Array<any>).toArray().indexOf(id);
  }

  protected _transact: (fn: () => void) => void;

  protected _objects: Y.Map<any>;
}
