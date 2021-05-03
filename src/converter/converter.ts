import {IDeserializer} from '../ideserializer';
import {ISerializer} from '../iserializer';

export interface Converter<T, R> {

  fromJson(value: R, deserializer: IDeserializer): T;

  toJson(value: T, serializer: ISerializer): R;
}
