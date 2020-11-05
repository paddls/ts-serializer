import {get, isArray} from 'lodash';
import {JsonPropertyContextConfiguration, JSON_PROPERTY_METADATA_KEY} from '../decorator/json-property.decorator';
import {DEFAULT_NORMALIZER_CONFIGURATION, NormalizerConfiguration} from './normalizer.configuration';
import {JSON_SUB_TYPES_METADATA_KEY, JsonSubTypesContext} from '../decorator/json-sub-types.decorator';
import {SerializeType} from '../common';

export class Denormalizer {

  public constructor(protected readonly configuration: NormalizerConfiguration = DEFAULT_NORMALIZER_CONFIGURATION) {}

  public denormalize<T>(type: SerializeType<T>, data: any): T {
    if (!data) {
      return null;
    }

    const result: T = this.instantiateObject(type, data);

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

  private instantiateObject<T>(type: SerializeType<T>, data: any): T {
    const jsonSubTypes: JsonSubTypesContext<T> = Reflect.getMetadata(JSON_SUB_TYPES_METADATA_KEY, type);

    if (!jsonSubTypes) {
      return new (type as new() => T)();
    }

    if (get(data, jsonSubTypes.field, null) === null) {
      throw new Error(`Field "${jsonSubTypes.field}" must not be null.`);
    }

    return new (jsonSubTypes.types[get(data, jsonSubTypes.field)]())();
  }
}
