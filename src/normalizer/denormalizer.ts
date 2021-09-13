import {JSON_PROPERTY_METADATA_KEY, JsonPropertyContextConfiguration} from '../decorator/json-property.decorator';
import {DEFAULT_NORMALIZER_CONFIGURATION, NormalizerConfiguration} from './normalizer.configuration';
import {SerializeType} from '../common';
import {IDeserializer} from '../ideserializer';
import {JSON_TYPE_SUPPORTS_METADATA_KEY} from '../decorator/json-type-supports.decorator';
import isArray from 'lodash-es/isArray';
import get from 'lodash/get';

export class Denormalizer implements IDeserializer {

  public constructor(protected readonly configuration: NormalizerConfiguration = DEFAULT_NORMALIZER_CONFIGURATION) {}

  protected static haveToDenormalize(globalDenormalizeConfiguration: boolean, columnDenormalizeConfiguration: boolean): boolean {
    if (columnDenormalizeConfiguration != null) {
      return columnDenormalizeConfiguration;
    }

    return globalDenormalizeConfiguration;
  }

  public deserialize<T>(type: SerializeType<T>|SerializeType<any>[], data: any): T|null {
    if (!data) {
      return null;
    }

    const result: T = this.instantiateObject(type, data);

    if (!result) {
      throw new Error('No type to instantiate');
    }

    const jsonProperties: JsonPropertyContextConfiguration<T, any>[] = Reflect.getMetadata(JSON_PROPERTY_METADATA_KEY, result);

    if (!jsonProperties) {
      return result;
    }

    jsonProperties.forEach((cc: JsonPropertyContextConfiguration<T, any>) => {
      if (cc.writeOnly) {
        return;
      }

      const jsonPropertyData: any = get(data, cc.field);

      if (jsonPropertyData === undefined && !Denormalizer.haveToDenormalize(this.configuration.denormalizeUndefined, cc.denormalizeUndefined)) {
        return;
      }

      if (jsonPropertyData === null && !Denormalizer.haveToDenormalize(this.configuration.denormalizeNull, cc.denormalizeNull)) {
        return;
      }

      if (isArray(jsonPropertyData)) {
        if (cc.type) {
          result[cc.propertyKey] = this.deserializeAll(cc.type(), jsonPropertyData);
        } else if (cc.customConverter) {
          result[cc.propertyKey] = jsonPropertyData.map((d: any) => new (cc.customConverter())().fromJson(d, this));
        } else {
          result[cc.propertyKey] = jsonPropertyData;
        }
      } else {
        if (cc.type && !!jsonPropertyData) {
          result[cc.propertyKey] = this.deserialize(cc.type(), jsonPropertyData);
        } else if (cc.customConverter) {
          result[cc.propertyKey] = new (cc.customConverter())().fromJson(jsonPropertyData, this);
        } else {
          result[cc.propertyKey] = jsonPropertyData;
        }
      }
    });

    return result;
  }

  public deserializeAll<T>(type: SerializeType<T>|SerializeType<any>[], data: any[]): T[] {
    if (!Array.isArray(data)) {
      throw new Error(`${data} is not an array.`);
    }

    return data
      .map((value: any) => {
        try {
          return this.deserialize(type, value);
        } catch (ex) {
          return undefined;
        }
      })
      .filter((obj: T) => obj !== undefined);
  }

  protected instantiateObject<T>(type: SerializeType<T>|SerializeType<any>[], data: any): T|null {
    let finalType: SerializeType<T>;

    if (Array.isArray(type)) {
      finalType = type.filter((t: SerializeType<T>) => {
        if (!Reflect.hasMetadata(JSON_TYPE_SUPPORTS_METADATA_KEY, t)) {
          return false;
        }

        return Reflect.getMetadata(JSON_TYPE_SUPPORTS_METADATA_KEY, t)(data);
      })[0];
    } else {
      finalType = type;
    }

    return !!finalType ? new (finalType as new() => T)() : null;
  }
}
