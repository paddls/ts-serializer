import {JSON_PROPERTY_METADATA_KEY, JsonPropertyContextConfiguration} from '../decorator/json-property.decorator';
import {DEFAULT_NORMALIZER_CONFIGURATION, NormalizerConfiguration} from './normalizer.configuration';
import {ISerializer} from '../iserializer';
import {isArray, set} from 'lodash';

export class Normalizer implements ISerializer {

  public constructor(protected readonly configuration: NormalizerConfiguration = DEFAULT_NORMALIZER_CONFIGURATION) {}

  protected static haveToNormalize(globalNormalizeConfiguration: boolean, columnNormalizeConfiguration: boolean): boolean {
    if (columnNormalizeConfiguration != null) {
      return columnNormalizeConfiguration;
    }

    return globalNormalizeConfiguration;
  }

  public serialize<T>(object: T): any {
    const result: {} = {};

    const jsonProperties: JsonPropertyContextConfiguration<T, any>[] = Reflect.getMetadata(JSON_PROPERTY_METADATA_KEY, object);

    if (!jsonProperties) {
      return result;
    }

    jsonProperties.forEach((jsonProperty: JsonPropertyContextConfiguration<T, any>) => {
      if (jsonProperty.readOnly) {
        return;
      }

      const jsonPropertyData: any = object[jsonProperty.propertyKey];

      if (jsonPropertyData === undefined && !Normalizer.haveToNormalize(this.configuration.normalizeUndefined, jsonProperty.normalizeUndefined)) {
        return;
      }

      if (jsonPropertyData === null && !Normalizer.haveToNormalize(this.configuration.normalizeNull, jsonProperty.normalizeNull)) {
        return;
      }

      if (isArray(jsonPropertyData)) {
        if (jsonProperty.type && !!jsonPropertyData) {
          set(result, jsonProperty.field, jsonPropertyData.map((d: any) => this.serialize(d)));
        } else if (jsonProperty.customConverter) {
          set(result, jsonProperty.field, jsonPropertyData.map((d: any) => new (jsonProperty.customConverter())().toJson(d, this)));
        } else {
          set(result, jsonProperty.field, jsonPropertyData);
        }
      } else {
        if (jsonProperty.type && !!jsonPropertyData) {
          set(result, jsonProperty.field, this.serialize(jsonPropertyData));
        } else if (jsonProperty.customConverter) {
          set(result, jsonProperty.field, new (jsonProperty.customConverter())().toJson(jsonPropertyData, this));
        } else {
          set(result, jsonProperty.field, jsonPropertyData);
        }
      }
    });

    return result;
  }

  public serializeAll<T>(objects: T[]): any[] {
    if (!Array.isArray(objects)) {
      throw new Error(`${objects} is not an array.`);
    }

    return objects.map((value: T) => this.serialize(value));
  }
}
