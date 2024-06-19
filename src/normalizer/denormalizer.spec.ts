import 'reflect-metadata';
import {Denormalizer} from './denormalizer';
import {DEFAULT_NORMALIZER_CONFIGURATION, NormalizerConfiguration} from './normalizer.configuration';
import {JsonProperty} from '../decorator/json-property.decorator';
import {DateConverter} from '../converter/date.converter';
import {JsonTypeSupports} from '../decorator/json-type-supports.decorator';
import {SerializerOptions} from '../serializer-options';
import {cloneDeep} from 'lodash-es';

class EmptyJsonProperty {
  public name: string = 'myEmptyJsonPropertyObject';
}

describe('Denormalizer', () => {
  const configuration: NormalizerConfiguration = cloneDeep(DEFAULT_NORMALIZER_CONFIGURATION);
  const defaultOptions: SerializerOptions = {};

  let denormalizerEmptyJsonProperty: Denormalizer;
  let denormalizer: Denormalizer;

  beforeEach(() => {
    denormalizerEmptyJsonProperty = new Denormalizer(configuration);
    denormalizer = new Denormalizer(configuration);
  });

  describe('#deserialize', () => {
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
      expect(denormalizerEmptyJsonProperty.deserialize(EmptyJsonProperty, null)).toBeNull();
    });

    it('should denormalize a class with no json property, no join json property and no sub collection', () => {
      expect(denormalizerEmptyJsonProperty.deserialize(EmptyJsonProperty, {name: 'anotherValue'})).toEqual(new EmptyJsonProperty());
    });

    it('should not denormalize json property with writeOnly parameter', () => {
      class MyClass {

        @JsonProperty({writeOnly: true})
        public name: string = 'test';
      }

      const obj: MyClass = denormalizer.deserialize(MyClass, {name: 'test2'}) as MyClass;
      expect(obj.name).toEqual('test');
    });

    it('should not denormalize json property with bad configuration group', () => {
      class MyClass {

        @JsonProperty({groups: 'Group1'})
        public name: string = 'test';
      }

      const obj: MyClass = denormalizer.deserialize(MyClass, {name: 'test2'}, {groups: ['MyGroup2', 'MyGroup3']}) as MyClass;
      expect(obj.name).toEqual('test');
    });

    it('should denormalize json property with good configuration group', () => {
      class MyClass {

        @JsonProperty({groups: 'Group1'})
        public name: string = 'test';
      }

      const obj: MyClass = denormalizer.deserialize(MyClass, {name: 'test2'}, {groups: 'Group1'}) as MyClass;
      expect(obj.name).toEqual('test2');
    });

    it('should denormalize json property without options group', () => {
      class MyClass {

        @JsonProperty({groups: 'Group1'})
        public name: string = 'test';
      }

      const obj: MyClass = denormalizer.deserialize(MyClass, {name: 'test2'}) as MyClass;
      expect(obj.name).toEqual('test2');
    });

    it('should not denormalize json property with a value to undefined with falsy configuration', () => {
      class MyClass {

        @JsonProperty()
        public name: string;
      }

      configuration.denormalizeUndefined = false;
      expect(denormalizer.deserialize(MyClass, {name: undefined})).toEqual(new MyClass());
    });

    it('should not denormalize json property with a value to null with falsy configuration and with denormalize undefined truthy', () => {
      class MyClass {

        @JsonProperty()
        public name: string;
      }

      configuration.denormalizeUndefined = true;
      configuration.denormalizeNull = false;

      expect(denormalizer.deserialize(MyClass, {name: null})).toEqual(new MyClass());
    });

    it('should denormalize json property with a value to null with falsy configuration and with column configuration truthy', () => {
      class MyClass {

        @JsonProperty({denormalizeNull: true, denormalizeUndefined: false})
        public name: string;
      }

      const expectedValue: MyClass = new MyClass();
      expectedValue.name = null;
      expect(denormalizer.deserialize(MyClass, {name: null})).toEqual(expectedValue);
    });

    it('should denormalize json property with a value to undefined with falsy configuration and with column configuration truthy', () => {
      class MyClass {

        @JsonProperty({denormalizeNull: false, denormalizeUndefined: true})
        public name: string;
      }

      const expectedValue: MyClass = new MyClass();
      expectedValue.name = undefined;
      expect(denormalizer.deserialize(MyClass, {name: undefined})).toEqual(expectedValue);
    });
  });

  describe('#deserializeAll', () => {
    class Mock {

      private id: string;
    }

    it('should call x times deserialize method when deserializeAll is called with array', () => {
      const data: Mock[] = [new Mock(), new Mock()];
      const toBeDenormalize: any = [{}, {}];

      jest.spyOn(denormalizer, 'deserialize').mockReturnValue(new Mock());

      expect(denormalizer.deserializeAll(Mock, toBeDenormalize)).toEqual(data);
      expect(denormalizer.deserialize).toHaveBeenCalledTimes(2);
      expect(denormalizer.deserialize).toHaveBeenCalledWith(Mock, toBeDenormalize[0], defaultOptions);
      expect(denormalizer.deserialize).toHaveBeenCalledWith(Mock, toBeDenormalize[1], defaultOptions);
    });

    it('should throw an error when deserializeAll is called with non array value', () => {
      const toBeDenormalize: any = {};

      expect(() => denormalizer.deserializeAll(Mock, toBeDenormalize)).toThrowError(`${toBeDenormalize} is not an array.`);
    });
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
      expect(denormalizer.deserialize(MyClass, {nested: undefined, nesteds: undefined})).toEqual(obj);
    });

    it('should normalize to null a json property with a type and a nullable value', () => {
      const obj: MyClass = new MyClass();
      obj.nested = null;
      obj.nesteds = null;
      expect(denormalizer.deserialize(MyClass, {nested: null, nesteds: null})).toEqual(obj);
    });

    it('should normalize to empty array a json property with a type and a empty array value', () => {
      const obj: MyClass = new MyClass();
      obj.nesteds = [];
      expect(denormalizer.deserialize(MyClass, {nested: null, nesteds: []})).toEqual(obj);
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

      expect(denormalizer.deserialize(
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

      expect(denormalizer.deserialize(MyClass, {name: null})).toEqual(new MyClass());
    });

    it('should not denormalize json property with a value to undefined with truthy configuration and with column configuration falsy', () => {
      class MyClass {

        @JsonProperty({denormalizeNull: true, denormalizeUndefined: false})
        public name: string;
      }

      expect(denormalizer.deserialize(MyClass, {name: undefined})).toEqual(new MyClass());
    });
  });

  describe('Denormalize values with few models and inheritance', () => {

    enum VehicleType {
      CAR = 'CAR',
      TRUCK = 'TRUCK'
    }

    abstract class Vehicle {

      @JsonProperty()
      public name: string;
    }

    @JsonTypeSupports((data: {type: VehicleType}) => data.type === VehicleType.CAR)
    class Car extends Vehicle {

      @JsonProperty()
      public seatingCapacity: number;
    }

    @JsonTypeSupports((data: {type: VehicleType}) => data.type === VehicleType.TRUCK)
    class Truck extends Vehicle {

      @JsonProperty()
      public payloadCapacity: number;
    }

    it('should deserialize a car via Car type', () => {
      const carData: any = {
        name: 'Passat',
        type: VehicleType.CAR,
        seatingCapacity: 4
      };
      const carExpected: Car = new Car();
      carExpected.name = 'Passat';
      carExpected.seatingCapacity = 4;

      expect(denormalizer.deserialize(Car, carData)).toEqual(carExpected);
    });

    it('should deserialize a truck via Car type', () => {
      const truckData: any = {
        name: 'Renault Truck',
        type: VehicleType.TRUCK,
        payloadCapacity: 3
      };
      const truckExpected: Truck = new Truck();
      truckExpected.name = 'Renault Truck';
      truckExpected.payloadCapacity = 3;

      expect(denormalizer.deserialize(Truck, truckData)).toEqual(truckExpected);
    });

    it('should throw an exception when no type match for deserialization of an object', () => {
      const data: any = {
        name: 'Test',
        type: 'charette',
        payloadCapacity: 3
      };

      expect(() => denormalizer.deserialize([Truck, Car], data)).toThrowError('No type to instantiate');
    });

    it('should deserialize a vehicle collection via an array of Vehicle type', () => {
      const vehicleData: any = [
        {
          name: 'Passat',
          type: VehicleType.CAR,
          seatingCapacity: 4
        },
        {
          name: 'Renault Truck',
          type: VehicleType.TRUCK,
          payloadCapacity: 3
        },
        {
          name: 'Test',
          type: 'charette',
          payloadCapacity: 5
        }
      ];
      const carExpected: Car = new Car();
      carExpected.name = 'Passat';
      carExpected.seatingCapacity = 4;

      const truckExpected: Truck = new Truck();
      truckExpected.name = 'Renault Truck';
      truckExpected.payloadCapacity = 3;

      expect(denormalizer.deserializeAll([Truck, Car], vehicleData)).toEqual([carExpected, truckExpected]);
    });

    it('should return empty array when no type have JsonTypeSupports', () => {
      const vehicleData: any = [
        {
          name: 'Passat',
          type: VehicleType.CAR,
          seatingCapacity: 4
        },
        {
          name: 'Renault Truck',
          type: VehicleType.TRUCK,
          payloadCapacity: 3
        }
      ];
      const carExpected: Car = new Car();
      carExpected.name = 'Passat';
      carExpected.seatingCapacity = 4;

      const truckExpected: Truck = new Truck();
      truckExpected.name = 'Renault Truck';
      truckExpected.payloadCapacity = 3;

      expect(denormalizer.deserializeAll([Date, Map], vehicleData)).toEqual([]);
    });
  });
});
