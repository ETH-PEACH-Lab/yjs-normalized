# yjs-normalized
This yjs extension offers generic maintainer and observer classes for normalized semi-structured data.

When dealing with nested or relational data in yjs applications, using a normalized state shape can be beneficial. This approach involves storing data in a flat structure similar to a database, which offers several benefits:
- Consistency: No duplicated data
- Simplicity: Nested data increases the complexity when observing for certain changes

The concept is based on the section: normalizing state shape in the [redux documentation](https://redux.js.org/usage/structuring-reducers/normalizing-state-shape).

Example structure:
```json
{
    "cells":{
        "byId":{
            "abc":{
                "id":"abc"
            },
        },
        "allIds":["abc"]
    }
}
```

This library comes with 2 features: Maintainer and Observer
## Maintainer
This class provides methods to add, delete, update, and manipulate objects within a Yjs Y.Map, ensuring that all changes are made within a transaction to maintain consistency.
### Features
- Add Objects: Add new objects to the collection.
- Delete Objects: Remove objects from the collection, with optional cascade functionality.
- Update Objects: Modify existing objects.
- Reorder Objects: Change the position of objects in the collection.
- Manage Property Arrays: Add, remove, and reorder elements in array properties of objects.

### Example Implementation
Define a maintainer for a certain normalized table:
```typescript
export default class CellsMaintainer extends Maintainer<ICell> {
}
```
Initialize the maintainer:
```typescript
    const cellsMaintainer = new CellsMaintainer(
      ydoc.getMap('cells'),
      ydoc.transact  
    );
```
Usage:
```typescript
    const cell: ICell = {...};
    cellsMaintainer.changeObject(cell);
```
## Observer
In general, observers facilitate the observation of semi-structured, normalized data within a Yjs Y.Map, track changes to the data and dispatch events accordingly.

### RootObserver
The RootObserver class is an abstract class that primarily functions as a root data observer and secondarily acts as a registry for sub-observers that track more granular changes within the data.

The class defines several abstract dispatcher methods (rootDispatcher, addDispatcher, deleteDispatcher, updatePropertyDispatcher, and allIdsDispatcher) that subclasses must implement to handle various types of data updates. 
These methods enable dispatching events accordingly.
- Root Dispatcher: Dispatches the entire normalized state.
- Add Dispatcher: Dispatches an event to add an object.
- Delete Dispatcher: Dispatches an event to delete an object by its id.
- Update Property Dispatcher: Dispatches an event to update a specific property of an object.
- All Ids Dispatcher: Dispatches an event to update the list of all object ids.
### Sub-observers
Sub-Observers are managed by the library itself. Following sub-observers are created / deleted and listened to during runtime: 
- AllIdsObserver: Observes Changes in the order of the ``allIds`` Y.Array
- ByIdObserver: Observes Additions and Deletions of Objects with in the ``byId`` Y.Map
- ObjectObserver: Observes changes in each Y.Map within the ``byId`` Y.Map

### Example Implementation
Users can integrate this class with their preferred state management library (e.g., Redux, MobX).
```typescript
export class CellsObserver extends RootObserver<ICell> {
    protected rootDispatcher: (payload: INormalizedState<ICell>) => void = (payload) => {
        //store.dispatch(setCells(payload))
    }
    protected addDispatcher: (payload: ICell) => void = (payload) => {
        //store.dispatch(addCell(payload))
    };
    protected deleteDispatcher: (payload: string) => void = (payload) => {
        //store.dispatch(deleteCell(payload))
    };
    protected updatePropertyDispatcher: (payload: {id: string, key: string, value:any}) => void = (payload) =>{
        //store.dispatch(updateCellProperty(payload))
    };
    protected allIdsDispatcher: (payload: string[]) => void = (payload) => {
        //store.dispatch(updateCellsAllIds(payload))
    };
}
```