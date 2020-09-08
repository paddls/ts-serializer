import {get, isArray} from 'lodash';
import {JsonPropertyContextConfiguration, JSON_PROPERTY_METADATA_KEY} from '../decorator/json-property.decorator';
import {DEFAULT_NORMALIZER_CONFIGURATION, NormalizerConfiguration} from './normalizer.configuration';

export class Denormalizer {

  public constructor(protected readonly configuration: NormalizerConfiguration = DEFAULT_NORMALIZER_CONFIGURATION) {}

  public denormalize<T>(type: new() => T, data: any|any[]): T {
    if (!data) {
      return null;
    }

    const result: T = new type();

    const jsonProperties: JsonPropertyContextConfiguration<T, any>[] = Reflect.getMetadata(JSON_PROPERTY_METADATA_KEY, result);

    if (!jsonProperties) {
      return result;
    }

    jsonProperties.forEach((cc: JsonPropertyContextConfiguration<T, any>) => {
      if (cc.writeOnly) {
        return;
      }

      const jsonPropertyData: any = get(data, cc.field);

      if (jsonPropertyData === undefined && !this.haveToDenormalize(this.configuration.denormalizeUndefined, cc.denormalizeUndefined)) {
        return;
      }

      if (jsonPropertyData === null && !this.haveToDenormalize(this.configuration.denormalizeNull, cc.denormalizeNull)) {
        return;
      }

      if (isArray(jsonPropertyData)) {
        if (cc.type) {
          result[cc.propertyKey] = jsonPropertyData.map((d: any) => this.denormalize(cc.type(), d));
        } else if (cc.customConverter) {
          result[cc.propertyKey] = jsonPropertyData.map((d: any) => new (cc.customConverter())().fromJson(d));
        } else {
          result[cc.propertyKey] = jsonPropertyData;
        }
      } else {
        if (cc.type && !!jsonPropertyData) {
          result[cc.propertyKey] = this.denormalize(cc.type(), jsonPropertyData);
        } else if (cc.customConverter) {
          result[cc.propertyKey] = new (cc.customConverter())().fromJson(jsonPropertyData);
        } else {
          result[cc.propertyKey] = jsonPropertyData;
        }
      }
    });

    return result;
  }

  private haveToDenormalize(globalDenormalizeConfiguration: boolean, columnDenormalizeConfiguration: boolean): boolean {
    if (columnDenormalizeConfiguration != null) {
      return columnDenormalizeConfiguration;
    }

    return globalDenormalizeConfiguration;
  }
}
