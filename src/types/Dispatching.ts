import { type INormalizedState } from './INormalizedState';
interface DocumentIdentifier {
  documentIdentifier?: string;
}
export type RootDispatch<T> = {
  state: INormalizedState<T>;
} & DocumentIdentifier;
export type AddDispatch<T> = {
  item: T;
} & DocumentIdentifier;
export type DeleteDispatch = {
  id: string;
} & DocumentIdentifier;
export type UpdatePropertyDispatch = {
  id: string;
  key: string;
  value: any;
} & DocumentIdentifier;
export type AllIdsDispatch = {
  ids: string[];
} & DocumentIdentifier;
