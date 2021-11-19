import 'reflect-metadata';
import {JsonProperty, JSON_PROPERTY_METADATA_KEY, JsonPropertyContext, JsonPropertyContextConfiguration} from './json-property.decorator';
import {DateConverter} from '../converter/date.converter';

describe('JsonPropertyDecorator', () => {

  let obj: any = null;

  const firstResult: JsonPropertyContextConfiguration<any, any> = {propertyKey: 'myProperty', field: 'myPropertyName'};
  const secondResult: JsonPropertyContextConfiguration<any, any> = {propertyKey: 'mySecondProperty', field: 'myBeautifulProperty'};
  const fourthResult: JsonPropertyContextConfiguration<any, any> = {propertyKey: 'myFourthProperty', field: 'myFourthProperty'};

  beforeEach(() => {
    obj = {
      myProperty: 'myValue',
      mySecondProperty: 'mySecondValue',
      myThirdProperty: 'myThirdValue',
      myFourthProperty: 'myFourthValue'
    };
  });

  it('should set up with an object', () => {
    const jsonPropertyContext: JsonPropertyContext<any, any> = {
      field: 'myPropertyName'
    };

    JsonProperty(jsonPropertyContext)(obj, 'myProperty');
    expect(Reflect.getMetadata(JSON_PROPERTY_METADATA_KEY, obj)).toEqual([
      firstResult
    ]);
  });

  it('should set up with a string', () => {
    JsonProperty('myBeautifulProperty')(obj, 'mySecondProperty');
    expect(Reflect.getMetadata(JSON_PROPERTY_METADATA_KEY, obj)).toEqual([
      secondResult
    ]);
  });

  it('should set up with a type', () => {
    JsonProperty(() => Date)(obj, 'myThirdProperty');
    expect(Reflect.getMetadata(JSON_PROPERTY_METADATA_KEY, obj).length).toEqual(1);
    expect(Reflect.getMetadata(JSON_PROPERTY_METADATA_KEY, obj)[0].type instanceof Function).toBe(true);
    expect(Reflect.getMetadata(JSON_PROPERTY_METADATA_KEY, obj)[0].type()).toBe(Date);
  });

  it('should set up with a group', () => {
    JsonProperty({groups: 'myGroup'})(obj, 'myThirdProperty');
    expect(Reflect.getMetadata(JSON_PROPERTY_METADATA_KEY, obj).length).toEqual(1);
    expect(Reflect.getMetadata(JSON_PROPERTY_METADATA_KEY, obj)[0].groups).toStrictEqual(['myGroup']);
  });

  it('should set up with some groups', () => {
    JsonProperty({groups: ['myGroup', 'otherGroup']})(obj, 'myThirdProperty');
    expect(Reflect.getMetadata(JSON_PROPERTY_METADATA_KEY, obj).length).toEqual(1);
    expect(Reflect.getMetadata(JSON_PROPERTY_METADATA_KEY, obj)[0].groups).toStrictEqual(['myGroup', 'otherGroup']);
  });

  it('should set up with multiple types', () => {
    JsonProperty(() => [Date, Map])(obj, 'myThirdProperty');
    expect(Reflect.getMetadata(JSON_PROPERTY_METADATA_KEY, obj).length).toEqual(1);
    expect(Reflect.getMetadata(JSON_PROPERTY_METADATA_KEY, obj)[0].type instanceof Function).toBe(true);
    expect(Reflect.getMetadata(JSON_PROPERTY_METADATA_KEY, obj)[0].type()).toEqual([Date, Map]);
  });

  it('should set up with nothing', () => {
    JsonProperty()(obj, 'myFourthProperty');
    expect(Reflect.getMetadata(JSON_PROPERTY_METADATA_KEY, obj)).toEqual([
      fourthResult
    ]);
  });

  it('should set up two properties', () => {
    JsonProperty({type: () => [Date]})(obj, 'myThirdProperty');
    JsonProperty()(obj, 'myFourthProperty');
    expect(Reflect.getMetadata(JSON_PROPERTY_METADATA_KEY, obj).length).toEqual(2);
    expect(Reflect.getMetadata(JSON_PROPERTY_METADATA_KEY, obj)[0].type instanceof Function).toBe(true);
    expect(Reflect.getMetadata(JSON_PROPERTY_METADATA_KEY, obj)[0].type()).toEqual([Date]);
    expect(Reflect.getMetadata(JSON_PROPERTY_METADATA_KEY, obj)[1]).toEqual(fourthResult);
  });

  it('should throw an error when type and custom converter are passed together', () => {
    expect(
      () => JsonProperty({type: () => Date, customConverter: () => DateConverter})(obj, 'myFifthProperty')
    ).toThrowError('You cannot specify both the converter and type attributes at the same time.');

    expect(Reflect.getMetadata(JSON_PROPERTY_METADATA_KEY, obj)).toBeUndefined();
  });
});
