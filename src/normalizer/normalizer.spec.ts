import 'reflect-metadata';
import {Normalizer} from './normalizer';
import {DEFAULT_NORMALIZER_CONFIGURATION, NormalizerConfiguration} from './normalizer.configuration';
import {JsonProperty} from '../decorator/json-property.decorator';
import {DateConverter} from '../converter/date.converter';
import {SerializerOptions} from '../serializer-options';
import {cloneDeep} from 'lodash-es';

class EmptyJsonProperty {
  public name: string = 'myEmptyJsonPropertyObject';
}

class ClassWithJsonProperty {}

describe('Normalizer', () => {
  const defaultOptions: SerializerOptions = {};
  let configuration: NormalizerConfiguration;
  let normalizerEmptyJsonProperty: Normalizer;
  let normalizer: Normalizer;

  beforeEach(() => {
    configuration = cloneDeep(DEFAULT_NORMALIZER_CONFIGURATION);
    normalizerEmptyJsonProperty = new Normalizer(configuration);
    normalizer = new Normalizer(configuration);
  });

  describe('#serialize', () => {

    it('should have a default configuration', () => {
      class MyNormalizer extends Normalizer {
        public getConfiguration(): NormalizerConfiguration {
          return this.configuration;
        }
      }

      const myNormalizer: MyNormalizer = new MyNormalizer();
      expect(myNormalizer.getConfiguration()).toEqual(DEFAULT_NORMALIZER_CONFIGURATION);
    });

    it('should normalize an object with no json property', () => {
      expect(normalizerEmptyJsonProperty.serialize(new EmptyJsonProperty())).toEqual({});
    });

    it('should not normalize json property with readOnly parameter', () => {
      class MyClass extends ClassWithJsonProperty {

        @JsonProperty({field: 'name', readOnly: true})
        public name: string = 'test';
      }

      const obj: MyClass = new MyClass();

      expect(normalizer.serialize(obj)).toEqual({});
    });

    it('should not normalize json property with bad configuration group', () => {
      class MyClass extends ClassWithJsonProperty {

        @JsonProperty({field: 'name', groups: 'Group1'})
        public name: string = 'test';
      }

      const obj: MyClass = new MyClass();

      expect(normalizer.serialize(obj, {groups: ['MyGroup2', 'MyGroup3']})).toEqual({});
    });

    it('should normalize json property with good configuration group', () => {
      class MyClass extends ClassWithJsonProperty {

        @JsonProperty({groups: 'Group1'})
        public name: string = 'test';
      }

      const obj: MyClass = new MyClass();

      expect(normalizer.serialize(obj, {groups: 'Group1'})).toEqual({name: 'test'});
    });

    it('should normalize json property without options group', () => {
      class MyClass extends ClassWithJsonProperty {

        @JsonProperty({groups: 'Group1'})
        public name: string = 'test';
      }

      const obj: MyClass = new MyClass();

      expect(normalizer.serialize(obj)).toEqual({name: 'test'});
    });

    it('should not normalize json property with a value to undefined with falsy configuration', () => {
      class MyClass extends ClassWithJsonProperty {

        @JsonProperty()
        public name: string = undefined;
      }

      const obj: MyClass = new MyClass();

      expect(normalizer.serialize(obj)).toEqual({});
    });

    it('should not normalize json property with a value to null with falsy configuration and with normalize undefined truthy', () => {
      class MyClass extends ClassWithJsonProperty {

        @JsonProperty()
        public name: string = null;
      }

      const obj: MyClass = new MyClass();
      configuration.normalizeUndefined = true;

      expect(normalizer.serialize(obj)).toEqual({});
    });

    it('should normalize json property with a value to null with falsy configuration and with column configuration truthy', () => {
      class MyClass {

        @JsonProperty({normalizeNull: true, normalizeUndefined: false})
        public name: string;
      }

      const obj: MyClass = new MyClass();
      obj.name = null;

      expect(normalizer.serialize(obj)).toEqual({name: null});
    });

    it('should normalize json property with a value to undefined with falsy configuration and with column configuration truthy', () => {
      class MyClass {

        @JsonProperty({normalizeNull: false, normalizeUndefined: true})
        public name: string;
      }

      const obj: MyClass = new MyClass();
      obj.name = undefined;

      expect(normalizer.serialize(obj)).toEqual({name: undefined});
    });
  });

  describe('#serializeAll', () => {
    class Mock {

      private id: string;
    }

    it('should call x times serialize when serializeAll is called with array', () => {
      const toBeNormalize: Mock[] = [new Mock(), new Mock()];
      const data: any = [{}, {}];
      jest.spyOn(normalizer, 'serialize').mockReturnValue(new Mock());

      expect(normalizer.serializeAll(toBeNormalize)).toEqual(data);
      expect(normalizer.serialize).toHaveBeenCalledTimes(2);
      expect(normalizer.serialize).toHaveBeenCalledWith(toBeNormalize[0], defaultOptions);
      expect(normalizer.serialize).toHaveBeenCalledWith(toBeNormalize[1], defaultOptions);
    });

    it('should throw an error when serializeAll is called with non array value', () => {
      const toBeNormalize: any = new Mock();

      expect(() => normalizer.serializeAll(toBeNormalize)).toThrowError(`${toBeNormalize} is not an array.`);
    });
  });

  describe('Normalize value with all normalize configuration truthy', () => {

    class MyNestedClass extends ClassWithJsonProperty {

      @JsonProperty({field: 'complexNested.nestedName'})
      public nestedName: string = null;

      @JsonProperty({customConverter: () => DateConverter})
      public createdAt: Date = null;

      @JsonProperty({customConverter: () => DateConverter})
      public otherDates: Date[];

      @JsonProperty()
      public otherNestedNames: string[];
    }

    class MyClass extends ClassWithJsonProperty {

      @JsonProperty(() => MyNestedClass)
      public nested: MyNestedClass = null;

      @JsonProperty(() => MyNestedClass)
      public nesteds: MyNestedClass[] = null;
    }

    beforeEach(() => {
      configuration.normalizeUndefined = true;
      configuration.normalizeNull = true;
    });

    it('should normalize to null a json property with a type and a null value', () => {
      const obj: MyClass = new MyClass();
      expect(normalizer.serialize(obj)).toEqual({
        nested: null,
        nesteds: null
      });
    });

    it('should normalize to empty array a json property with a type and a empty array value', () => {
      const obj: MyClass = new MyClass();
      obj.nesteds = [];
      expect(normalizer.serialize(obj)).toEqual({
        nested: null,
        nesteds: []
      });
    });

    it('should normalize a json property with a type and normalize all others json properties', () => {
      const obj: MyClass = new MyClass();
      obj.nested = new MyNestedClass();
      obj.nested.nestedName = 'toto';
      obj.nested.otherNestedNames = ['titi'];
      obj.nesteds = [new MyNestedClass()];
      obj.nesteds[0].nestedName = 'tata';

      const d: Date = new Date();
      obj.nested.createdAt = d;
      obj.nesteds[0].createdAt = d;

      const d1: Date = new Date();
      const d2: Date = new Date();
      obj.nesteds[0].otherDates = [d1, d2];

      expect(normalizer.serialize(obj)).toEqual({
        nested: {
          complexNested: {
            nestedName: 'toto'
          },
          createdAt: d.toISOString(),
          otherDates: undefined,
          otherNestedNames: ['titi']
        },
        nesteds: [
          {
            complexNested: {
              nestedName: 'tata'
            },
            createdAt: d.toISOString(),
            otherDates: [
              d1.toISOString(),
              d2.toISOString()
            ],
            otherNestedNames: undefined
          }
        ]
      });
    });

    it('should not normalize json property with a value to null with truthy configuration and with column configuration falsy', () => {
      class MyClass {

        @JsonProperty({normalizeNull: false, normalizeUndefined: true})
        public name: string;
      }

      const obj: MyClass = new MyClass();
      obj.name = null;
      expect(normalizer.serialize(obj)).toEqual({});
    });

    it('should not normalize json property with a value to undefined with truthy configuration and with column configuration falsy', () => {
      class MyClass {

        @JsonProperty({normalizeNull: true, normalizeUndefined: false})
        public name: string;
      }

      const obj: MyClass = new MyClass();
      obj.name = undefined;
      expect(normalizer.serialize(obj)).toEqual({});
    });
  });
});
