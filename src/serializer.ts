import {SerializeType} from './common';
import {ISerializer} from './iserializer';
import {IDeserializer} from './ideserializer';
import {SerializerOptions} from './serializer-options';

export class Serializer implements ISerializer, IDeserializer {

  public constructor(private readonly normalizer: ISerializer,
                     private readonly denormalizer: IDeserializer) {
    if (!this.normalizer) {
      throw new Error('You must provide a normalizer.');
    }

    if (!this.denormalizer) {
      throw new Error('You must provide a denormalizer.');
    }
  }

  public serialize<T>(object: T, options: SerializerOptions = {}): any {
    return this.normalizer.serialize(object, options);
  }

  public serializeAll<T>(objects: T[], options: SerializerOptions = {}): any[] {
    return this.normalizer.serializeAll(objects, options);
  }

  public deserialize<T>(type: SerializeType<T>|SerializeType<any>[], data: any, options: SerializerOptions = {}): T {
    return this.denormalizer.deserialize<T>(type, data, options);
  }

  public deserializeAll<T>(type: SerializeType<T>|SerializeType<any>[], data: any[], options: SerializerOptions = {}): T[] {
    return this.denormalizer.deserializeAll(type, data, options);
  }
}
