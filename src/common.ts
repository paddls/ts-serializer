export type ConstructorFunction<T> = new(...args: any[]) => T;
// tslint:disable-next-line: ban-types
export type AbstractConstructorFunction<T> = Function & { prototype: T };

export type SerializeType<T> = ConstructorFunction<T>|AbstractConstructorFunction<T>;
