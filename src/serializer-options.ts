import isArray from 'lodash-es/isArray';
import cloneDeep from 'lodash-es/cloneDeep';

export interface SerializerOptions {

  groups?: string|string[];
}

export function normalizeSerializerOptions(options: SerializerOptions): SerializerOptions {
  const normalizedOptions: SerializerOptions = cloneDeep(options);

  if (normalizedOptions.groups && !isArray(normalizedOptions.groups)) {
    normalizedOptions.groups = [normalizedOptions.groups];
  }

  return normalizedOptions;
}
