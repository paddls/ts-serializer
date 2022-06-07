export function get(obj: any, path: string|string[], defValue?: any): any {
  if (!path) {
    return undefined;
  }

  const pathArray: string[] = Array.isArray(path) ? path : path.match(/([^[.\]])+/g);
  const result: any = pathArray.reduce(
    (prevObj: string, key: string) => prevObj && prevObj[key],
    obj
  );

  return result === undefined ? defValue : result;
}

export function set(obj: any, path: string|string[], value: any): void {
  const pathArray: string[] = Array.isArray(path) ? path : path.match(/([^[.\]])+/g);

  pathArray.reduce((acc: string, key: string, i: number) => {
    if (acc[key] === undefined) {
      acc[key] = {};
    }

    if (i === pathArray.length - 1) {
      acc[key] = value;
    }

    return acc[key];
  }, obj);
}

export function intersection(array: any, ...args: any): any[] {
  if (!array || !Array.isArray(array)) {
    return [];
  }

  return array.filter((item: any) => args.every((arr: any) => arr.includes(item)));
}

