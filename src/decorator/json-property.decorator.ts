import {Converter} from '../converter/converter';

export const JSON_PROPERTY_METADATA_KEY: string = 'ts-serializer:json-properties';

export interface JsonPropertyContext<T, R> {

  field?: string;

  type?: () => new(...args: any[]) => T;

  readOnly?: boolean;

  writeOnly?: boolean;

  customConverter?: () => new(...args: any[]) => Converter<T, R>;
}

export interface JsonPropertyContextConfiguration<T, R> extends JsonPropertyContext<T, R> {

  propertyKey: string;
}

export function JsonProperty<T, R>(jsonPropertyContext?: JsonPropertyContext<T, R>|string|(() => new(...args: any[]) => T)): any {
  return (target: any, propertyKey: string) => {
    let jsonPropertyMetadata: JsonPropertyContextConfiguration<T, R> = {
      propertyKey,
      field: propertyKey
    };

    if (typeof jsonPropertyContext === 'object') {
      if (jsonPropertyContext.type && jsonPropertyContext.customConverter) {
        throw new Error('You cannot specify both the converter and type attributes at the same time.');
      }

      jsonPropertyMetadata = {...jsonPropertyMetadata, ...jsonPropertyContext};
      if (!!jsonPropertyContext.field && jsonPropertyContext.field !== '') {
        jsonPropertyMetadata.field = jsonPropertyContext.field;
      }
    } else if (typeof jsonPropertyContext === 'string') {
      jsonPropertyMetadata.field = jsonPropertyContext;
    } else if (typeof jsonPropertyContext === 'function') {
      jsonPropertyMetadata.type = jsonPropertyContext;
    }

    let metas: JsonPropertyContextConfiguration<T, R>[] = [];
    if (Reflect.hasMetadata(JSON_PROPERTY_METADATA_KEY, target)) {
      metas = Reflect.getMetadata(JSON_PROPERTY_METADATA_KEY, target);
    }
    Reflect.defineMetadata(JSON_PROPERTY_METADATA_KEY, metas.concat(jsonPropertyMetadata), target);
  };
}
