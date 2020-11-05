import {ConstructorFunction} from '../common';

export const JSON_SUB_TYPES_METADATA_KEY: string = 'ts-serializer:json-sub-types';

export interface JsonSubTypesContext<T> {

  field: string;

  types: {[key: string]: () => ConstructorFunction<T>};
}

export function JsonSubTypes<T>(jsonSubTypesContext: JsonSubTypesContext<T>): any {
  return (target: any) => {
    Reflect.defineMetadata(JSON_SUB_TYPES_METADATA_KEY, jsonSubTypesContext, target);
  };
}
