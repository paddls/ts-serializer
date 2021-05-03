export const JSON_TYPE_SUPPORTS_METADATA_KEY: string = 'ts-serializer:json-type-supports';

export function JsonTypeSupports<T, R>(context: (data: any) => boolean): any {
  return (target: any) => {
    Reflect.defineMetadata(JSON_TYPE_SUPPORTS_METADATA_KEY, context, target);
  };
}
