import 'reflect-metadata';

import {Normalizer} from '../normalizer/normalizer';
import {Denormalizer} from '../normalizer/denormalizer';
import {Serializer} from '../serializer';
import {Particulier} from './particulier.model';
import {Pro} from './pro.model';
import {Driver} from './driver.model';
import {Address} from './address.model';
import {Car} from './car.model';
import {Truck} from './truck.model';

describe('Serializer E2E', () => {
  let vehicleData: any;
  let driversData: any;

  let normalizer: Normalizer;
  let denormalizer: Denormalizer;
  let serializer: Serializer;

  beforeEach(() => {
    normalizer = new Normalizer();
    denormalizer = new Denormalizer();
    serializer = new Serializer(normalizer, denormalizer);
  });

  beforeEach(() => {
    vehicleData = [
      {
        name: 'Passat',
        type: 'CAR',
        seatingCapacity: 4
      },
      {
        name: 'Renault Truck',
        type: 'TRUCK',
        payloadCapacity: 3
      },
      {
        name: 'Renault Truck',
        type: 'CHARETTE',
        payloadCapacity: 3
      }
    ];

    driversData = [
      {
        name: 'Jean Claude',
        type: 'PARTICULIER',
        vehicles: [vehicleData[0]],
        address: {
          street: '7th My Street',
          zipCode: 51000,
          city: 'BeerCity',
          country: 'France'
        },
        createdAt: '2022-04-26T13:39:16.271Z'
      },
      {
        name: 'Michel',
        type: 'PRO',
        vehicles: vehicleData,
        address: {
          street: '8th My Street',
          zipCode: 51000,
          city: 'BeerCity',
          country: 'France'
        },
        createdAt: '2021-04-26T13:39:16.271Z'
      }
    ];
  });

  describe('Deserialization', () => {

    it('should deserialize data into drivers', () => {
      const drivers: Driver[] = serializer.deserializeAll([Particulier, Pro], driversData);

      expect(drivers.length).toEqual(2);
      expect(drivers[0]).toBeInstanceOf(Particulier);
      expect(drivers[0].name).toEqual('Jean Claude');
      expect(drivers[0].createdAt).toEqual(new Date(driversData[0].createdAt));
      expect(drivers[0].address).toBeInstanceOf(Address);
      expect(drivers[0].address.street).toEqual('7th My Street');
      expect(drivers[0].address.zipCode).toEqual(51000);
      expect(drivers[0].address.city).toEqual('BeerCity');
      expect(drivers[0].address.country).toEqual('France');
      expect(drivers[0].vehicles.length).toEqual(1);
      expect(drivers[0].vehicles[0]).toBeInstanceOf(Car);
      expect(drivers[0].vehicles[0].name).toEqual('Passat');
      expect((drivers[0].vehicles[0] as Car).seatingCapacity).toEqual(4);


      expect(drivers[1]).toBeInstanceOf(Pro);
      expect(drivers[1].name).toEqual('Michel');
      expect(drivers[1].createdAt).toEqual(new Date(driversData[1].createdAt));
      expect(drivers[1].address).toBeInstanceOf(Address);
      expect(drivers[1].address.street).toEqual('8th My Street');
      expect(drivers[1].address.zipCode).toEqual(51000);
      expect(drivers[1].address.city).toEqual('BeerCity');
      expect(drivers[1].address.country).toEqual('France');
      expect(drivers[1].vehicles.length).toEqual(2);
      expect(drivers[1].vehicles[0]).toBeInstanceOf(Car);
      expect(drivers[1].vehicles[0].name).toEqual('Passat');
      expect((drivers[1].vehicles[0] as Car).seatingCapacity).toEqual(4);
      expect(drivers[1].vehicles[1]).toBeInstanceOf(Truck);
      expect(drivers[1].vehicles[1].name).toEqual('Renault Truck');
      expect((drivers[1].vehicles[1] as Truck).payloadCapacity).toEqual(3);
    });
  });

  describe('Serialization', () => {
    let deserializedDrivers: any;

    beforeEach(() => {
      deserializedDrivers = serializer.deserializeAll([Pro, Particulier], driversData);

      delete driversData[0].type;
      delete driversData[1].type;

      delete vehicleData[0].type;
      delete vehicleData[1].type;

      vehicleData.splice(2, 1);
    });

    it('should serialize drivers and deep object into same drivers data without type and without third vehicle', () => {
      const serializedDrivers: Driver[] = serializer.serializeAll(deserializedDrivers);

      expect(serializedDrivers).toEqual(driversData);
    });
  });
});
