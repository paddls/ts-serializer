import {Serializer} from './serializer';
import {Normalizer} from './normalizer/normalizer';
import {Denormalizer} from './normalizer/denormalizer';

class Mock {

  private id: string;
}

describe('Serializer', () => {
  let normalizer: Normalizer;
  let denormalizer: Denormalizer;
  let serializer: Serializer;

  beforeEach(() => {
    normalizer = new Normalizer(null);
    denormalizer = new Denormalizer(null);
    serializer = new Serializer(normalizer, denormalizer);
  });

  it('should throw an error when no normalizer is provide', () => {
    expect(() => new Serializer(null, null)).toThrowError('You must provide a normalizer.');
  });

  it('should throw an error when no denormalizer is provide', () => {
    expect(() => new Serializer(new Normalizer(), null)).toThrowError('You must provide a denormalizer.');
  });

  it('should call denormalizer when deserialize is call', () => {
    const denormalized: Mock = new Mock();
    const data: any = {};
    spyOn(denormalizer, 'denormalize').and.returnValue(denormalized);

    expect(serializer.deserialize(Mock, data)).toBe(denormalized);
    expect(denormalizer.denormalize).toHaveBeenCalledTimes(1);
    expect(denormalizer.denormalize).toHaveBeenCalledWith(Mock, data);
  });

  it('should call normalizer when serialize is call', () => {
    const toBeNormalize: Mock = new Mock();
    const data: any = {};
    spyOn(normalizer, 'normalize').and.returnValue(data);

    expect(serializer.serializer(toBeNormalize)).toBe(data);
    expect(normalizer.normalize).toHaveBeenCalledTimes(1);
    expect(normalizer.normalize).toHaveBeenCalledWith(toBeNormalize);
  });
});
