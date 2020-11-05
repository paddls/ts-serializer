import {Normalizer} from './normalizer/normalizer';
import {Denormalizer} from './normalizer/denormalizer';
import {SerializeType} from './common';

export class Serializer {

  public constructor(private readonly normalizer: Normalizer,
                     private readonly denormalizer: Denormalizer) {
    if (!this.normalizer) {
      throw new Error('You must provide a normalizer.');
    }

    if (!this.denormalizer) {
      throw new Error('You must provide a denormalizer.');
    }
  }

  public serialize<T>(object: T): any {
    return this.normalizer.normalize(object);
  }

  public serializeAll<T>(objects: T[]): any[] {
    if (!Array.isArray(objects)) {
      throw new Error(`${objects} is not an array.`);
    }

    return objects.map((value: T) => this.serialize(value));
  }

  public deserialize<T>(type: SerializeType<T>, data: any): T {
    return this.denormalizer.denormalize<T>(type, data);
  }

  public deserializeAll<T>(type: SerializeType<T>, data: any[]): T[] {
    if (!Array.isArray(data)) {
      throw new Error(`${data} is not an array.`);
    }

    return data.map((value: any) => this.deserialize(type, value));
  }
}
