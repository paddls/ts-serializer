import {DEFAULT_NORMALIZER_CONFIGURATION, NormalizerConfiguration} from './normalizer.configuration';

describe('NormalizerConfiguration', () => {

  it('should has default values', () => {
    const configuration: NormalizerConfiguration = {...DEFAULT_NORMALIZER_CONFIGURATION};

    expect(configuration.denormalizeNull).toBeFalsy();
    expect(configuration.denormalizeUndefined).toBeFalsy();
    expect(configuration.normalizeNull).toBeFalsy();
    expect(configuration.normalizeUndefined).toBeFalsy();
  });
});
