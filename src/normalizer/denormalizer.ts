import {get, isArray} from 'lodash';
import {ColumnContextConfiguration, COLUMNS_METADATA_KEY} from '../decorator/column.decorator';
import {DEFAULT_NORMALIZER_CONFIGURATION, NormalizerConfiguration} from './normalizer.configuration';

export class Denormalizer {

  public constructor(protected readonly configuration: NormalizerConfiguration = DEFAULT_NORMALIZER_CONFIGURATION) {}

  public denormalize<T>(type: new() => T, data: any|any[]): T {
    if (!data) {
      return null;
    }

    const result: T = new type();

    const columns: ColumnContextConfiguration<T, any>[] = Reflect.getMetadata(COLUMNS_METADATA_KEY, result);

    if (!columns) {
      return result;
    }

    columns.forEach((cc: ColumnContextConfiguration<T, any>) => {
      if (cc.writeOnly) {
        return;
      }

      const columnData: any = get(data, cc.field);

      if (columnData === undefined && !this.configuration.denormalizeUndefined) {
        return;
      }

      if (columnData === null && !this.configuration.denormalizeNull) {
        return;
      }

      if (isArray(columnData)) {
        if (cc.type) {
          result[cc.propertyKey] = columnData.map((d: any) => this.denormalize(cc.type(), d));
        } else if (cc.customConverter) {
          result[cc.propertyKey] = columnData.map((d: any) => new (cc.customConverter())().fromJson(d));
        } else {
          result[cc.propertyKey] = columnData;
        }
      } else {
        if (cc.type && !!columnData) {
          result[cc.propertyKey] = this.denormalize(cc.type(), columnData);
        } else if (cc.customConverter) {
          result[cc.propertyKey] = new (cc.customConverter())().fromJson(columnData);
        } else {
          result[cc.propertyKey] = columnData;
        }
      }
    });

    return result;
  }
}
