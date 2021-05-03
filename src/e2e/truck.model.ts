import {Vehicle} from './vehicle.model';
import {JsonTypeSupports} from '../decorator/json-type-supports.decorator';
import {JsonProperty} from '../decorator/json-property.decorator';

@JsonTypeSupports((data: { type: 'CAR'|'TRUCK' }) => data.type === 'TRUCK')
export class Truck extends Vehicle {

  @JsonProperty()
  public payloadCapacity: number;
}
