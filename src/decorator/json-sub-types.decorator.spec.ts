import 'reflect-metadata';
import {JSON_SUB_TYPES_METADATA_KEY, JsonSubTypes, JsonSubTypesContext} from './json-sub-types.decorator';

describe('JsonSubTypesDecorator', () => {

  it('should put context on target', () => {
    const obj: any = {};
    const jsonSubTypesContext: JsonSubTypesContext<any> = {
      field: 'myPropertyName',
      types: {}
    };

    JsonSubTypes(jsonSubTypesContext)(obj);
    expect(Reflect.getMetadata(JSON_SUB_TYPES_METADATA_KEY, obj)).toEqual(jsonSubTypesContext);
  });
});
