import {JsonProperty} from '../decorator/json-property.decorator';

export class Address {

  @JsonProperty()
  public street: string;

  @JsonProperty()
  public zipCode: number;

  @JsonProperty()
  public city: string;

  @JsonProperty()
  public country: string;
}
