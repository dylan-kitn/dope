import type { Cache } from './interface';

export default function cacheINF<K extends string | number | symbol, V>(): Cache<K, V> {
  let pool: Array<{ key: K, value: V }> = [];

  function find(key: K) {
    return pool.find(it => it.key === key);
  }
  function findIndex(key: K) {
    return pool.findIndex(it => it.key === key);
  }

  const inst = {
    size: pool.length,
    limit: Infinity,
    set: (key: K, value: V) => {
      const temp = find(key);
      if (temp === undefined) {
        pool.unshift({ key, value });
      } else {
        temp.value = value;
      }
    },
    get: (key: K) => {
      return find(key)?.value;
    },
    find: (key: K) => {
      return find(key)?.value;
    },
    has: (key: K) => find(key) !== undefined,
    del: (key: K) => {
      const temp = find(key);
      if (temp !== undefined) {
        const idx = findIndex(key);
        pool.splice(idx, 1);
      }
      return temp?.value;
    },
    clear: () => {
      pool = [];
    },
    keys: () => {
      return pool.map(it => it.key);
    },
    values: () => {
      return pool.map(it => it.value);
    },
    entries: () => {
      return pool.map(it => [it.key, it.value] as [K, V]);
    },
    toJSON: () => {
      return pool;
    }
  };

  Object.defineProperties(inst, {
    size: {
      get() {
        return pool.length;
      }
    },
    limit: {
      get() {
        return Infinity;
      },
      set(_: number) {
        // NOTHING
      }
    }
  });

  return inst;
}
