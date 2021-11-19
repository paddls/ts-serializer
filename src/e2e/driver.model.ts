import {JsonProperty} from '../decorator/json-property.decorator';
import {Vehicle} from './vehicle.model';
import {Address} from './address.model';
import {Truck} from './truck.model';
import {Car} from './car.model';
import {DateConverter} from '../converter/date.converter';

export abstract class Driver {

  @JsonProperty()
  public name: string;

  @JsonProperty(() => Address)
  public address: Address;

  @JsonProperty(() => [Car, Truck])
  public vehicles: Vehicle[];

  @JsonProperty({customConverter: () => DateConverter})
  public createdAt: Date;

  @JsonProperty({groups: ['WithAge']})
  public age: number;

  @JsonProperty({groups: 'WithSize'})
  public size: number;
}
