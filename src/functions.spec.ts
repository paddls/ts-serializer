import {get, intersection, set} from './functions';

describe('#get', () => {
  const simpleObject: unknown = {a: {b: 2}};
  const complexObject: unknown = {a: [{bar: {c: 3}}]};
  const falsyObject: unknown = {a: null, b: undefined, c: 0};

  it('should return 2 for simpleObject and path "a.b"', () => {
    expect(get(simpleObject, 'a.b')).toBe(2);
  });

  it('should return 3 for complexObject and path "a[0].bar.c"', () => {
    expect(get(complexObject, 'a[0].bar.c')).toBe(3);
  });

  it('should return 3 for complexObject and path array ["a", "0", "bar", "c"]', () => {
    expect(get(complexObject, ['a', '0', 'bar', 'c'])).toBe(3);
  });

  it('should return "default" for simpleObject and invalid path "a.bar.c"', () => {
    expect(get(simpleObject, 'a.bar.c', 'default')).toBe('default');
  });

  it('should return "default" for complexObject and invalid path "a.bar.c"', () => {
    expect(get(complexObject, 'a.bar.c', 'default')).toBe('default');
  });

  it('should return undefined for complexObject and null path', () => {
    expect(get(complexObject, null)).toBeUndefined();
  });

  it('should return null for falsyObject and path "a"', () => {
    expect(get(falsyObject, 'a', 'default')).toBeNull();
  });

  it('should return undefined for falsyObject and path "b"', () => {
    expect(get(falsyObject, 'b')).toBeUndefined();
  });

  it('should return 0 for falsyObject and path "c"', () => {
    expect(get(falsyObject, 'c', 'default')).toBe(0);
  });
});

describe('#set', () => {
  const object: any = {a: [{bar: {c: 3}}]};

  it('should set object.a[0].bar.c to 4', () => {
    set(object, 'a[0].bar.c', 4);
    expect(object.a[0].bar.c).toBe(4);
  });

  it('should set object.x[0].y.z to 5', () => {
    set(object, ['x', '0', 'y', 'z'], 5);
    expect(object.x[0].y.z).toBe(5);
  });
});

describe('#intersection', () => {
  it('should return [2] for intersection([2, 1], [2, 3])', () => {
    expect(intersection([2, 1], [2, 3])).toEqual([2]);
  });
});


