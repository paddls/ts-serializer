import {JSON_PROPERTY_METADATA_KEY, JsonPropertyContextConfiguration} from '../decorator/json-property.decorator';
import {DEFAULT_NORMALIZER_CONFIGURATION, NormalizerConfiguration} from './normalizer.configuration';
import {ISerializer} from '../iserializer';
import {normalizeSerializerOptions, SerializerOptions} from '../serializer-options';
import {set} from 'lodash-es';
import {intersection} from 'lodash-es';

export class Normalizer implements ISerializer {

  public constructor(protected readonly configuration: NormalizerConfiguration = DEFAULT_NORMALIZER_CONFIGURATION) {}

  protected static haveToNormalize(globalNormalizeConfiguration: boolean, columnNormalizeConfiguration: boolean): boolean {
    if (columnNormalizeConfiguration != null) {
      return columnNormalizeConfiguration;
    }

    return globalNormalizeConfiguration;
  }

  public serialize<T>(object: T, options: SerializerOptions = {}): any {
    return this.processing(object, normalizeSerializerOptions(options));
  }

  public serializeAll<T>(objects: T[], options: SerializerOptions = {}): any[] {
    if (!Array.isArray(objects)) {
      throw new Error(`${objects} is not an array.`);
    }

    return objects.map((value: T) => this.serialize(value, options));
  }

  private processing<T>(object: T, options: SerializerOptions): any {
    const result: {} = {};

    const jsonProperties: JsonPropertyContextConfiguration<T, any>[] = Reflect.getMetadata(JSON_PROPERTY_METADATA_KEY, object);

    if (!jsonProperties) {
      return result;
    }

    jsonProperties
      .filter((jsonProperty: JsonPropertyContextConfiguration<T, any>) => !jsonProperty.readOnly)
      .filter((jsonProperty: JsonPropertyContextConfiguration<T, any>) => !options?.groups || intersection(jsonProperty.groups, options.groups).length > 0)
      .filter((jsonProperty: JsonPropertyContextConfiguration<T, any>) => object[jsonProperty.propertyKey] !== undefined || !!Normalizer.haveToNormalize(this.configuration.normalizeUndefined, jsonProperty.normalizeUndefined))
      .filter((jsonProperty: JsonPropertyContextConfiguration<T, any>) => object[jsonProperty.propertyKey] !== null || !!Normalizer.haveToNormalize(this.configuration.normalizeNull, jsonProperty.normalizeNull))
      .forEach((jsonProperty: JsonPropertyContextConfiguration<T, any>) => {
        const jsonPropertyData: any = object[jsonProperty.propertyKey];

        if (Array.isArray(jsonPropertyData)) {
          if (jsonProperty.type && !!jsonPropertyData) {
            set(result, jsonProperty.field, jsonPropertyData.map((d: any) => this.serialize(d, options)));
          } else if (jsonProperty.customConverter) {
            set(result, jsonProperty.field, jsonPropertyData.map((d: any) => new (jsonProperty.customConverter())().toJson(d, this, options)));
          } else {
            set(result, jsonProperty.field, jsonPropertyData);
          }
        } else {
          if (jsonProperty.type && !!jsonPropertyData) {
            set(result, jsonProperty.field, this.serialize(jsonPropertyData, options));
          } else if (jsonProperty.customConverter) {
            set(result, jsonProperty.field, new (jsonProperty.customConverter())().toJson(jsonPropertyData, this, options));
          } else {
            set(result, jsonProperty.field, jsonPropertyData);
          }
        }
      });

    return result;
  }
}
