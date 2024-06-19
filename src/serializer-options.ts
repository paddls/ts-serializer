import {cloneDeep} from 'lodash-es';

export interface SerializerOptions {

  groups?: string|string[];
}

export function normalizeSerializerOptions(options: SerializerOptions): SerializerOptions {
  const normalizedOptions: SerializerOptions = cloneDeep(options);

  if (normalizedOptions.groups && !Array.isArray(normalizedOptions.groups)) {
    normalizedOptions.groups = [normalizedOptions.groups];
  }

  return normalizedOptions;
}
