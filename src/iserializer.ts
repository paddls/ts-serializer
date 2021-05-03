export interface ISerializer {

  serialize<T>(object: T): any;

  serializeAll<T>(objects: T[]): any[];
}
