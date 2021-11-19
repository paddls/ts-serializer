import {IDeserializer} from '../ideserializer';
import {ISerializer} from '../iserializer';
import {SerializerOptions} from '../serializer-options';

export interface Converter<T, R> {

  fromJson(value: R, deserializer: IDeserializer, options?: SerializerOptions): T;

  toJson(value: T, serializer: ISerializer, options?: SerializerOptions): R;
}
