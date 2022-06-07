import {get, intersection, set} from './util';

describe('Util', () => {

  describe('#get', () => {

    const simpleObject = { a: { b: 2 } }
    const complexObject = { a: [{ bar: { c: 3 } }] }
    const falsyObject = { a: null, b: undefined, c: 0 }

    it('a.b', () => {
      expect(get(simpleObject, 'a.b')).toEqual(2);
    });

    it('a[0].bar.c', () => {
      expect(get(complexObject, 'a[0].bar.c')).toEqual(3);
    });

    it('[\'a\', \'0\', \'bar\', \'c\']', () => {
      expect(get(complexObject, ['a', '0', 'bar', 'c'])).toEqual(3);
    });

    it('a.bar.c with default', () => {
      expect(get(simpleObject, 'a.bar.c', 'default')).toEqual('default');
    });

    it('a.bar.c with default', () => {
      expect(get(complexObject, 'a.bar.c', 'default')).toEqual('default');
    });

    it('null', () => {
      expect(get(complexObject, null)).toEqual(undefined);
    });

    it('a with default', () => {
      expect(get(falsyObject, 'a', 'default')).toEqual(null);
    });

    it('b with default', () => {
      expect(get(falsyObject, 'b', 'default')).toEqual('default');
    });

    it('c with default', () => {
      expect(get(falsyObject, 'c', 'default')).toEqual(0);
    });
  });

  describe('#set', () => {
    let object: any;

    beforeEach(() => {
      object = { a: [{ bar: { c: 3 } }] };
    });

    it('\'a[0].bar.c\' 4', () => {
      set(object, 'a[0].bar.c', 4);
      expect(object.a[0].bar.c).toEqual(4);
    });

    it('[\'x\', \'0\', \'y\', \'z\']', () => {
      set(object, ['x', '0', 'y', 'z'], 5);
      expect(object.x[0].y.z).toEqual(5);
    });
  });

  describe('#intersection', () => {

    it('should return the intersection', () => {
      expect(intersection([2, 1], [2, 3])).toEqual([2]);
    });
  });
})
