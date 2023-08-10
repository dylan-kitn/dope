import cacheINF from './cache_inf';
import cacheLRU from './cache_lru';
import type { Func, FuncToKey, FuncWrapOpts, FuncWrappedInCache, Key } from './interface';
import { defaultToKey } from './util';

export function wrapFnInCache<
  Fn extends Func,
  FnToKey extends FuncToKey<Fn, Key> = FuncToKey<Fn, string>
>(
  fn: Fn,
  toKey: FnToKey
): FuncWrappedInCache<Fn, FnToKey>;

export function wrapFnInCache<
  Fn extends Func,
  FnToKey extends FuncToKey<Fn, Key> = FuncToKey<Fn, string>
>(
  fn: Fn,
  opts?: FuncWrapOpts<Fn, FnToKey>
): FuncWrappedInCache<Fn, FnToKey>;

export function wrapFnInCache<
  Fn extends Func,
  FnToKey extends FuncToKey<Fn, Key> = FuncToKey<Fn, string>
>(
  fn: Fn,
  arg?: FnToKey | FuncWrapOpts<Fn, FnToKey>
): FuncWrappedInCache<Fn, FnToKey> {
  type K = ReturnType<FnToKey>;

  const { toKey: toKeyOrigin, lru = true } = Object.prototype.toString.call(arg).slice(8, -1) === 'Function'
    ? { toKey: <FnToKey>arg, lru: undefined }
    : <FuncWrapOpts<Fn, FnToKey>>(arg || {});

  const toKey = toKeyOrigin || (defaultToKey as unknown as FnToKey);

  const cache = !lru
    ? cacheINF<K, ReturnType<Fn>>()
    : cacheLRU<K, ReturnType<Fn>>(
        Object.prototype.toString.call(lru).slice(8, -1) === 'Number'
          ? <number>lru
          : 10
      );

  func.hasCache = (key: K) => cache.has(key);
  func.rmFromCache = (key: K) => cache.del(key);
  func.clearCache = () => cache.clear();
  func.forceRerun = function(this: typeof func | ThisType<Fn> | void, ...args: Parameters<Fn>) {
    const that = this === func ? undefined : this;
    cache.del(toKey(that, ...args) as K);
    return func.call(that, ...args);
  }

  return func;

  function func(this: ThisType<Fn> | void, ...args: Parameters<Fn>): ReturnType<Fn> {
    const key = toKey(this, ...args) as K;
    try {
      const retInCache = cache.get(key);
      if (retInCache !== undefined) {
        return retInCache;
      }
  
      const ret = fn.call(this, ...args)!;
      cache.set(key, ret);

      if (ret.catch) {
        return ret.catch((err: unknown) => {
          cache.del(key);
          throw err;
        });
      } else {
        return ret;
      }
    } catch (err: unknown) {
      cache.del(key);
      throw err;
    }
  }
}
