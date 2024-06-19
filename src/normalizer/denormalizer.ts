import {JSON_PROPERTY_METADATA_KEY, JsonPropertyContextConfiguration} from '../decorator/json-property.decorator';
import {DEFAULT_NORMALIZER_CONFIGURATION, NormalizerConfiguration} from './normalizer.configuration';
import {SerializeType} from '../common';
import {IDeserializer} from '../ideserializer';
import {JSON_TYPE_SUPPORTS_METADATA_KEY} from '../decorator/json-type-supports.decorator';
import {normalizeSerializerOptions, SerializerOptions} from '../serializer-options';
import {get} from 'lodash-es';
import {intersection} from 'lodash-es';

export class Denormalizer implements IDeserializer {

  public constructor(protected readonly configuration: NormalizerConfiguration = DEFAULT_NORMALIZER_CONFIGURATION) {}

  protected static haveToDenormalize(globalDenormalizeConfiguration: boolean, columnDenormalizeConfiguration: boolean): boolean {
    if (columnDenormalizeConfiguration != null) {
      return columnDenormalizeConfiguration;
    }

    return globalDenormalizeConfiguration;
  }

  public deserialize<T>(type: SerializeType<T>|SerializeType<any>[], data: any, options: SerializerOptions = {}): T|null {
    return this.processing(type, data, normalizeSerializerOptions(options));
  }

  public deserializeAll<T>(type: SerializeType<T>|SerializeType<any>[], data: any[], options: SerializerOptions = {}): T[] {
    if (!Array.isArray(data)) {
      throw new Error(`${data} is not an array.`);
    }

    return data
      .map((value: any) => {
        try {
          return this.deserialize(type, value, options);
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

  private processing<T>(type: SerializeType<T>|SerializeType<any>[], data: any, options: SerializerOptions): T|null {
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

    jsonProperties
      .filter((cc: JsonPropertyContextConfiguration<T, any>) => !cc.writeOnly)
      .filter((cc: JsonPropertyContextConfiguration<T, any>) => !options?.groups || intersection(cc.groups, options.groups).length > 0)
      .filter((cc: JsonPropertyContextConfiguration<T, any>) => get(data, cc.field) !== undefined || !!Denormalizer.haveToDenormalize(this.configuration.denormalizeUndefined, cc.denormalizeUndefined))
      .filter((cc: JsonPropertyContextConfiguration<T, any>) => get(data, cc.field) !== null || !!Denormalizer.haveToDenormalize(this.configuration.denormalizeNull, cc.denormalizeNull))
      .forEach((cc: JsonPropertyContextConfiguration<T, any>) => {
        const jsonPropertyData: any = get(data, cc.field);

        if (Array.isArray(jsonPropertyData)) {
          if (cc.type) {
            result[cc.propertyKey] = this.deserializeAll(cc.type(), jsonPropertyData, options);
          } else if (cc.customConverter) {
            result[cc.propertyKey] = jsonPropertyData.map((d: any) => new (cc.customConverter())().fromJson(d, this, options));
          } else {
            result[cc.propertyKey] = jsonPropertyData;
          }
        } else {
          if (cc.type && !!jsonPropertyData) {
            result[cc.propertyKey] = this.deserialize(cc.type(), jsonPropertyData, options);
          } else if (cc.customConverter) {
            result[cc.propertyKey] = new (cc.customConverter())().fromJson(jsonPropertyData, this, options);
          } else {
            result[cc.propertyKey] = jsonPropertyData;
          }
        }
      });

    return result;
  }
}
