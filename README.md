# TS-Serializer

![ts-serializer-ci](https://github.com/witty-services/ts-serializer/workflows/build/badge.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/witty-services/ts-serializer/badge.svg?branch=master)](https://coveralls.io/github/witty-services/ts-serializer?branch=master)
[![npm version](https://badge.fury.io/js/%40witty-services%2Fts-serializer.svg)](https://badge.fury.io/js/%40witty-services%2Fts-serializer)
![GitHub](https://img.shields.io/github/license/witty-services/ts-serializer)
![GitHub repo size](https://img.shields.io/github/repo-size/witty-services/ts-serializer)
![GitHub last commit](https://img.shields.io/github/last-commit/witty-services/ts-serializer)
![GitHub issues](https://img.shields.io/github/issues/witty-services/ts-serializer)
![GitHub top language](https://img.shields.io/github/languages/top/witty-services/ts-serializer)

Serialize and deserialize JSON into strongly typed typescript objects using decorators.

## Summary

* [How to install](#how-to-install)
* [How to use](#how-to-use)
    * [Configure your models](#configure-your-models)
    * [Serialization](#serialization)
    * [Deserialization](#deserialization)
    * [Serialization configuration](#serializer-configuration)
* [API](#api)
  * [JsonPropertyDecorator](#jsonproperty)
  * [JsonPropertyContext](#jsonpropertycontext)
    * [JsonTypeSupports](#jsontypesupports)
    * [NormalizerConfiguration](#normalizerconfiguration)
    * [CustomConverter](#customconverter)
* [How to run Unit Tests](#how-to-run-unit-tests)

## How to install

To install the library, run :

```
npm i @witty-services/ts-serializer
```

## How to use

### Configure your models

````typescript
import {JsonProperty, JsonTypeSupports} from '@witty-services/ts-serializer';
import {Address} from './address.model';

export class User {

  @JsonProperty({readOnly: true})
  public id: string;

  @JsonProperty()
  public firstName: string

  @JsonProperty('lastname')
  public lastName: string;

  @JsonProperty(Address)
  public address: Address;

  @JsonProperty(() => [Car, Truck])
  public vehicles: Vehicle[];

  @JsonProperty({groups: ['WithAge', 'OtherGroup']})
  public age: number;

  @JsonProperty({groups: 'WithSize'})
  public size: number;
}

abstract class Vehicle {

  @JsonProperty()
  public name: string;
}

@JsonTypeSupports((data: { type: 'CAR' | 'TRUCK' }) => data.type === 'CAR')
class Car extends Vehicle {

  @JsonProperty()
  public seatingCapacity: number;
}

@JsonTypeSupports((data: { type: 'CAR' | 'TRUCK' }) => data.type === 'TRUCK')
class Truck extends Vehicle {

  @JsonProperty()
  public payloadCapacity: number;
}
````

You can find the full ``@JsonProperty()`` decorator configuration in [API](#API) section.

### Serialization

```typescript
import {Serializer, Normalizer, Denormalizer} from '@witty-services/ts-serializer';

const object: MyClass = new MyClass();

const serializer: Serializer = new Serialize(new Normalizer(), new Denormalizer());
const data: any = serializer.serialize(object);
```

### Deserialization

```typescript
import {Serializer, Normalizer, Denormalizer} from '@witty-services/ts-serializer';

class MyClass {
  // ...
}

const data: any = {};


const serializer: Serializer = new Serializer(new Normalizer(), new Denormalizer());
const myObject: MyClass = serializer.deserialize(MyClass, data);
```

### Serializer configuration

You can configure serializer using ``NormalizerConfiguration`` class :

````typescript
import {NormalizerConfiguration} from '@witty-services/ts-serializer';

const configuration: NormalizerConfiguration = {
  denormalizeNull: false,
  denormalizeUndefined: false,
  normalizeNull: false,
  normalizeUndefined: false
};
````

### Groups

You can use groups to restrict the serialization/deserialization process. Without any options provided to serializer,
groups configuration aren't used. But if you want to use groups defined in JsonProperty decorator, you can use them like
this :

```typescript
import {Serializer, Normalizer, Denormalizer} from '@witty-services/ts-serializer';
import {JsonProperty} from '@witty-services/json-property.decorator';

class MyClass {

  @JsonProperty()
  public attribute1: string;

  @JsonProperty({groups: 'Group1'})
  public attribute2: string;

  @JsonProperty({groups: ['Group1', 'Group2']})
  public attribute3: string;

  @JsonProperty({groups: 'Group3'})
  public attribute4: string;
}

const data: any = {
  //...
};


const serializer: Serializer = new Serializer(new Normalizer(), new Denormalizer());
const myObject: MyClass = serializer.deserialize(MyClass, data, {groups: ['Group1', 'Group2']});

// here, myObject has only attribute2 and attribute3 valued
```

## API

### JsonProperty

| Argument            | Type                                                                  | Required   | Description                                                                                                                                                                                                                                                                                                                                                                                                     |
|----------           | ------                                                                | ---------- | ------------                                                                                                                                                                                                                                                                                                                                                                                                    |
| jsonPropertyContext | [JsonPropertyContext](#jsonpropertycontext) &#124; string &#124; Type | No         | If no argument is provided, the attribute will be mapped with a field in json object with the same name.<br/> If the argument is a string, the attribute will be mapped with a field in json object named with the provided string.<br/> If the argument is a type, the attribute will be mapped with a field in json object with the same name, but the type provided will be used to make the transformation. |

### JsonPropertyContext

| Attribute       | Type                   | Required   | Description                                                                                                                         |
|-----------      | ------                 | ---------- | ------------                                                                                                                        |
| field           | string                 | No         | You can change the name of mapped field. The attribute accept a path ``` 'path.to.myField' ```                                      |
| type            | Function<Type>         | No         | You can provide a type to convert json data to an object of Type or convert an object of Type to json data using Type configuration |
| readOnly        | boolean                | No         | You can want to use the attribute configuration only in the deserialization process                                                 |
| writeOnly       | boolean                | No         | You can want to use the attribute configuration only in the serialization process                                                   |
| customConverter | Converter              | No         | You can add a custom converter object of type [Converter](#converter) to convert your object                                        |
| groups          | string &#124; string[] | No         | You can restrict serialization/deserialization process with groups                                                                  |

### JsonTypeSupports

| Argument  | Type              | Required   | Description                                                                                                     |
|---------- | ------            | ---------- | ------------                                                                                                    |
| context   | Function<boolean> | Yes        | This argument sets up the function to call when the serializer searches a type which matches with received data |

### NormalizerConfiguration

| Attribute            | Type    | Required   | Default value   | Description                                                    |
|-----------           | ------  | ---------- | --------------- | ------------                                                   |
| denormalizerNull     | boolean | No         | false           | Denormalizer configuration to not denormalize null values      |
| denormalizeUndefined | boolean | No         | false           | Denormalizer configuration to not denormalize undefined values |
| normalizeNull        | boolean | No         | false           | Normalizer configuration to not normalize null values          |
| normalizeUndefined   | boolean | No         | false           | Normalizer configuration to not normalize undefined values     |

### CustomConverter

``CustomConverter`` is an interface to make some converter. TS-Serializer provides a ``DateConverter`` to convert a date
to an ISOString and an ISOString to a date.

### SerializerOptions

``SerializerOptions`` is an interface which represents optional options to provide to serialization/deserialization
process.

| Attribute  | Type                   | Required   | Default value   | Description                                            |
|----------- | ------                 | ---------- | --------------- | ------------                                           |
| groups     | string &#124; string[] | No         | undefined       | Groups to use in serialization/deserialization process |

## How to run Unit Tests

To run unit tests and generate coverage, run :

```
npm run test
```
