import {SerializerOptions} from './serializer-options';

export interface ISerializer {

  serialize<T>(object: T, options?: SerializerOptions): any;

  serializeAll<T>(objects: T[], options?: SerializerOptions): any[];
}
