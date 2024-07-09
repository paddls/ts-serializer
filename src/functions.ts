export const get: (obj: unknown, path: (string | string[]), defValue?: unknown) => unknown = (obj: unknown, path: string | string[], defValue: unknown): unknown => {
  // If path is not defined or it has false value
  if (!path) {
    return undefined;
  }
  // Check if path is string or array. Regex : ensure that we do not have '.' and brackets.
  // Regex explained: https://regexr.com/58j0k
  const pathArray: string[] = Array.isArray(path) ? path : path.match(/([^[.\]])+/g);
  // Find value
  const result: unknown = pathArray.reduce(
    (prevObj: unknown, key: string): unknown => prevObj && prevObj[key],
    obj
  );
  // If found value is undefined return default value; otherwise return the value
  return result === undefined ? defValue : result;
};

export const set: (obj: unknown, path: (string | string[]), value: unknown) => void = (obj: unknown, path: string | string[], value: unknown): void => {
  // Regex explained: https://regexr.com/58j0k
  const pathArray: (string | string[]) | RegExpMatchArray = Array.isArray(path) ? path : path.match(/([^[.\]])+/g);

  pathArray.reduce((acc: unknown, key: string, i: number) => {
    if (acc[key] === undefined) {
      acc[key] = {};
    }
    if (i === pathArray.length - 1) {
      acc[key] = value;
    }
    return acc[key];
  }, obj);
};

export const intersection: (arr: unknown[], ...args: unknown[][]) => unknown[] = (arr: unknown[], ...args: unknown[][]): unknown[] =>
  arr.filter((item: unknown) => args.every((a: unknown[]) => a.includes(item)));
