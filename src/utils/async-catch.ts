function asyncCatch<T, E = any>(promise: Promise<T>) {
  return new Promise<[E, undefined] | [undefined, T]>((resolve) => {
    promise.then((res) => resolve([undefined, res])).catch((err) => resolve([err, undefined]));
  });
}

export default asyncCatch;
