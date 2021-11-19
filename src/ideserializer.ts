import {SerializeType} from './common';
import {SerializerOptions} from './serializer-options';

export interface IDeserializer {

  deserialize<T>(type: SerializeType<T>|SerializeType<any>[], data: any, options?: SerializerOptions): T;

  deserializeAll<T>(type: SerializeType<T>|SerializeType<any>[], data: any[], options?: SerializerOptions): T[];
}
