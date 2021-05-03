import {Vehicle} from './vehicle.model';
import {JsonTypeSupports} from '../decorator/json-type-supports.decorator';
import {JsonProperty} from '../decorator/json-property.decorator';

@JsonTypeSupports((data: { type: 'CAR'|'TRUCK' }) => data.type === 'CAR')
export class Car extends Vehicle {

  @JsonProperty()
  public seatingCapacity: number;
}
