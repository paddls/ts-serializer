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
    spyOn(denormalizer, 'deserialize').and.returnValue(denormalized);

    expect(serializer.deserialize(Mock, data)).toBe(denormalized);
    expect(denormalizer.deserialize).toHaveBeenCalledTimes(1);
    expect(denormalizer.deserialize).toHaveBeenCalledWith(Mock, data);
  });

  it('should call normalizer when serialize is call', () => {
    const toBeNormalize: Mock = new Mock();
    const data: any = {};
    spyOn(normalizer, 'serialize').and.returnValue(data);

    expect(serializer.serialize(toBeNormalize)).toBe(data);
    expect(normalizer.serialize).toHaveBeenCalledTimes(1);
    expect(normalizer.serialize).toHaveBeenCalledWith(toBeNormalize);
  });

  it('should call normalizer when serializeAll is called', () => {
    const toBeNormalize: Mock[] = [new Mock(), new Mock()];
    const data: any = [{}, {}];
    spyOn(normalizer, 'serializeAll').and.returnValues(data);

    expect(serializer.serializeAll(toBeNormalize)).toEqual(data);
    expect(normalizer.serializeAll).toHaveBeenCalledTimes(1);
    expect(normalizer.serializeAll).toHaveBeenCalledWith(toBeNormalize);
  });

  it('should call denormalizer when deserializeAll is called', () => {
    const data: Mock[] = [new Mock(), new Mock()];
    const toBeDenormalize: any = [{}, {}];
    spyOn(denormalizer, 'deserializeAll').and.returnValues(data);

    expect(serializer.deserializeAll(Mock, toBeDenormalize)).toEqual(data);
    expect(denormalizer.deserializeAll).toHaveBeenCalledTimes(1);
    expect(denormalizer.deserializeAll).toHaveBeenCalledWith(Mock, toBeDenormalize);
  });
});
