export type ConstructorFunction<T> = new(...args: any[]) => T;

export type SerializeType<T> = ConstructorFunction<T>;
