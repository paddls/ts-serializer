import {Normalizer} from './normalizer/normalizer';
import {Denormalizer} from './normalizer/denormalizer';

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

  public deserialize<T>(type: new() => T, data: any|any[]): T {
    return this.denormalizer.denormalize<T>(type, data);
  }
}
