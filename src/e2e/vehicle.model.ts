import {JsonProperty} from '../decorator/json-property.decorator';

export abstract class Vehicle {

  @JsonProperty()
  public name: string;
}
