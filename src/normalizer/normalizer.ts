import {JSON_PROPERTY_METADATA_KEY, JsonPropertyContextConfiguration} from '../decorator/json-property.decorator';
import {isArray, set} from 'lodash';
import {DEFAULT_NORMALIZER_CONFIGURATION, NormalizerConfiguration} from './normalizer.configuration';

export class Normalizer {

  public constructor(protected readonly configuration: NormalizerConfiguration = DEFAULT_NORMALIZER_CONFIGURATION) {}

  public normalize<T>(object: T): any {
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

      if (jsonPropertyData === undefined && !this.haveToNormalize(this.configuration.normalizeUndefined, jsonProperty.normalizeUndefined)) {
        return;
      }

      if (jsonPropertyData === null && !this.haveToNormalize(this.configuration.normalizeNull, jsonProperty.normalizeNull)) {
        return;
      }

      if (isArray(jsonPropertyData)) {
        if (jsonProperty.type && !!jsonPropertyData) {
          set(result, jsonProperty.field, jsonPropertyData.map((d: any) => this.normalize(d)));
        } else if (jsonProperty.customConverter) {
          set(result, jsonProperty.field, jsonPropertyData.map((d: any) => new (jsonProperty.customConverter())().toJson(d)));
        } else {
          set(result, jsonProperty.field, jsonPropertyData);
        }
      } else {
        if (jsonProperty.type && !!jsonPropertyData) {
          set(result, jsonProperty.field, this.normalize(jsonPropertyData));
        } else if (jsonProperty.customConverter) {
          set(result, jsonProperty.field, new (jsonProperty.customConverter())().toJson(jsonPropertyData));
        } else {
          set(result, jsonProperty.field, jsonPropertyData);
        }
      }
    });

    return result;
  }

  private haveToNormalize(globalNormalizeConfiguration: boolean, columnNormalizeConfiguration: boolean): boolean {
    if (columnNormalizeConfiguration != null) {
      return columnNormalizeConfiguration;
    }

    return globalNormalizeConfiguration;
  }
}
