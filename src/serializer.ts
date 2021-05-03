import {SerializeType} from './common';
import {ISerializer} from './iserializer';
import {IDeserializer} from './ideserializer';

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

  public serialize<T>(object: T): any {
    return this.normalizer.serialize(object);
  }

  public serializeAll<T>(objects: T[]): any[] {
    return this.normalizer.serializeAll(objects);
  }

  public deserialize<T>(type: SerializeType<T>|SerializeType<any>[], data: any): T {
    return this.denormalizer.deserialize<T>(type, data);
  }

  public deserializeAll<T>(type: SerializeType<T>|SerializeType<any>[], data: any[]): T[] {
    return this.denormalizer.deserializeAll(type, data);
  }
}
