import {SerializeType} from './common';

export interface IDeserializer {

  deserialize<T>(type: SerializeType<T>|SerializeType<any>[], data: any): T;

  deserializeAll<T>(type: SerializeType<T>|SerializeType<any>[], data: any[]): T[];
}
