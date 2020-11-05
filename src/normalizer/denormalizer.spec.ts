import 'reflect-metadata';
import {Denormalizer} from './denormalizer';
import {DEFAULT_NORMALIZER_CONFIGURATION, NormalizerConfiguration} from './normalizer.configuration';
import {JsonProperty} from '../decorator/json-property.decorator';
import {DateConverter} from '../converter/date.converter';
import {cloneDeep} from 'lodash';
import {JsonSubTypes} from '..';

class EmptyJsonProperty {
  public name: string = 'myEmptyJsonPropertyObject';
}

describe('Denormalizer', () => {
  const configuration: NormalizerConfiguration = cloneDeep(DEFAULT_NORMALIZER_CONFIGURATION);

  let denormalizerEmptyJsonProperty: Denormalizer;
  let denormalizer: Denormalizer;

  beforeEach(() => {
    denormalizerEmptyJsonProperty = new Denormalizer(configuration);
    denormalizer = new Denormalizer(configuration);
  });

  it('should have a default configuration', () => {
    class MyDenormalizer extends Denormalizer {

      public getConfiguration(): NormalizerConfiguration {
        return this.configuration;
      }
    }

    const myDenormalizer: MyDenormalizer = new MyDenormalizer();
    expect(myDenormalizer.getConfiguration()).toEqual(DEFAULT_NORMALIZER_CONFIGURATION);
  });

  it('should not denormalize an null object', () => {
    expect(denormalizerEmptyJsonProperty.denormalize(EmptyJsonProperty, null)).toBeNull();
  });

  it('should denormalize a class with no json property, no join json property and no sub collection', () => {
    expect(denormalizerEmptyJsonProperty.denormalize(EmptyJsonProperty, {name: 'anotherValue'})).toEqual(new EmptyJsonProperty());
  });

  it('should not normalize json property with writeOnly parameter', () => {
    class MyClass {

      @JsonProperty({field: 'name', writeOnly: true})
      public name: string = 'test';
    }

    const obj: MyClass = denormalizer.denormalize(MyClass, {name: 'test2'}) as MyClass;
    expect(obj.name).toEqual('test');
  });

  it('should not denormalize json property with a value to undefined with falsy configuration', () => {
    class MyClass {

      @JsonProperty()
      public name: string;
    }

    configuration.denormalizeUndefined = false;
    expect(denormalizer.denormalize(MyClass, {name: undefined})).toEqual(new MyClass());
  });

  it('should not denormalize json property with a value to null with falsy configuration and with denormalize undefined truthy', () => {
    class MyClass {

      @JsonProperty()
      public name: string;
    }

    configuration.denormalizeUndefined = true;
    configuration.denormalizeNull = false;

    expect(denormalizer.denormalize(MyClass, {name: null})).toEqual(new MyClass());
  });

  it('should denormalize json property with a value to null with falsy configuration and with column configuration truthy', () => {
    class MyClass {

      @JsonProperty({denormalizeNull: true, denormalizeUndefined: false})
      public name: string;
    }

    const expectedValue: MyClass = new MyClass();
    expectedValue.name = null;
    expect(denormalizer.denormalize(MyClass, {name: null})).toEqual(expectedValue);
  });

  it('should denormalize json property with a value to undefined with falsy configuration and with column configuration truthy', () => {
    class MyClass {

      @JsonProperty({denormalizeNull: false, denormalizeUndefined: true})
      public name: string;
    }

    const expectedValue: MyClass = new MyClass();
    expectedValue.name = undefined;
    expect(denormalizer.denormalize(MyClass, {name: undefined})).toEqual(expectedValue);
  });

  describe('Denormalize value with all denormalize configuration truthy', () => {

    class MyNestedClass {

      @JsonProperty({field: 'complexNested.nestedName'})
      public nestedName: string = null;

      @JsonProperty({customConverter: () => DateConverter})
      public createdAt: Date = null;

      @JsonProperty({customConverter: () => DateConverter})
      public otherDates: Date[];

      @JsonProperty()
      public otherNestedNames: string[];
    }

    class MyClass {

      @JsonProperty(() => MyNestedClass)
      public nested: MyNestedClass = null;

      @JsonProperty(() => MyNestedClass)
      public nesteds: MyNestedClass[] = null;
    }

    beforeEach(() => {
      configuration.denormalizeUndefined = true;
      configuration.denormalizeNull = true;
    });

    it('should normalize to undefined a json property with a type and a undefined value', () => {
      const obj: MyClass = new MyClass();
      obj.nested = undefined;
      obj.nesteds = undefined;
      expect(denormalizer.denormalize(MyClass, {nested: undefined, nesteds: undefined})).toEqual(obj);
    });

    it('should normalize to null a json property with a type and a nullable value', () => {
      const obj: MyClass = new MyClass();
      obj.nested = null;
      obj.nesteds = null;
      expect(denormalizer.denormalize(MyClass, {nested: null, nesteds: null})).toEqual(obj);
    });

    it('should normalize to empty array a json property with a type and a empty array value', () => {
      const obj: MyClass = new MyClass();
      obj.nesteds = [];
      expect(denormalizer.denormalize(MyClass, {nested: null, nesteds: []})).toEqual(obj);
    });

    it('should denormalize a json property with a type and denormalize all others json properties', () => {
      const obj: MyClass = new MyClass();
      obj.nested = new MyNestedClass();
      obj.nested.nestedName = 'toto';
      obj.nested.otherDates = undefined;
      obj.nested.otherNestedNames = ['titi'];

      obj.nesteds = [new MyNestedClass()];
      obj.nesteds[0].nestedName = 'tata';

      const d: Date = new Date();
      obj.nested.createdAt = d;
      obj.nesteds[0].createdAt = d;
      const d1: Date = new Date();
      const d2: Date = new Date();
      obj.nesteds[0].otherDates = [d1, d2];
      obj.nesteds[0].otherNestedNames = undefined;

      expect(denormalizer.denormalize(
        MyClass,
        {
          nested: {
            complexNested: {
              nestedName: 'toto'
            },
            createdAt: d.toISOString(),
            otherNestedNames: ['titi']
          },
          nesteds: [
            {
              complexNested: {
                nestedName: 'tata'
              },
              createdAt: d.toISOString(),
              otherDates: [d1.toISOString(), d2.toISOString()],
            }
          ]
        }
      )).toEqual(obj);
    });

    it('should not denormalize json property with a value to null with truthy configuration and with column configuration falsy', () => {
      class MyClass {

        @JsonProperty({denormalizeNull: false, denormalizeUndefined: true})
        public name: string;
      }

      expect(denormalizer.denormalize(MyClass, {name: null})).toEqual(new MyClass());
    });

    it('should not denormalize json property with a value to undefined with truthy configuration and with column configuration falsy', () => {
      class MyClass {

        @JsonProperty({denormalizeNull: true, denormalizeUndefined: false})
        public name: string;
      }

      expect(denormalizer.denormalize(MyClass, {name: undefined})).toEqual(new MyClass());
    });
  });

  describe('Denormalize values with inheritance', () => {

    enum VehicleType {
      CAR = 'CAR',
      TRUCK = 'TRUCK'
    }

    @JsonSubTypes<Vehicle>({
      field: 'type',
      types: {
        CAR: () => Car,
        TRUCK: () => Truck
      }
    })
    abstract class Vehicle {

      @JsonProperty()
      public name: string;
    }

    class Car extends Vehicle {

      @JsonProperty()
      public seatingCapacity: number;
    }

    class Truck extends Vehicle {

      @JsonProperty()
      public payloadCapacity: number;
    }

    it('should deserialize a car via Vehicle inheritance system', () => {
      const carData: any = {
        name: 'Passat',
        type: VehicleType.CAR,
        seatingCapacity: 4
      };
      const carExpected: Car = new Car();
      carExpected.name = 'Passat';
      carExpected.seatingCapacity = 4;

      expect(denormalizer.denormalize(Vehicle, carData)).toEqual(carExpected);
    });

    it('should deserialize a truck via Vehicle inheritance system', () => {
      const carData: any = {
        name: 'Renault Truck',
        type: VehicleType.TRUCK,
        payloadCapacity:3
      };
      const truckExpected: Truck = new Truck();
      truckExpected.name = 'Renault Truck';
      truckExpected.payloadCapacity = 3;

      expect(denormalizer.denormalize(Truck, carData)).toEqual(truckExpected);
    });

    it('should throw an error when deserialize via inheritance system when field is undefined', () => {
      const carData: any = {
        name: 'Renault Truck',
        payloadCapacity:3
      };
      const truckExpected: Truck = new Truck();
      truckExpected.name = 'Renault Truck';
      truckExpected.payloadCapacity = 3;

      expect(() => denormalizer.denormalize(Truck, carData)).toThrowError('Field "type" must not be null.');
    });

    it('should throw an error when deserialize via inheritance system when field is null', () => {
      const carData: any = {
        name: 'Renault Truck',
        type: null,
        payloadCapacity:3
      };
      const truckExpected: Truck = new Truck();
      truckExpected.name = 'Renault Truck';
      truckExpected.payloadCapacity = 3;

      expect(() => denormalizer.denormalize(Truck, carData)).toThrowError('Field "type" must not be null.');
    });
  })
});
