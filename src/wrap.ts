import cacheINF from './cache_inf';
import cacheLRU from './cache_lru';
import type { Func, FuncToKey, FuncWrapOpts, FuncWrappedInCache } from './interface';
import { defaultToKey } from './util';

export function wrapFnInCache<Fn extends Func>(fn: Fn, toKey?: FuncToKey<Fn>): FuncWrappedInCache<Fn>;
export function wrapFnInCache<Fn extends Func>(fn: Fn, opts?: FuncWrapOpts<Fn>): FuncWrappedInCache<Fn>;
export function wrapFnInCache<Fn extends Func>(
  fn: Fn,
  arg?: FuncToKey<Fn> | FuncWrapOpts<Fn>
): FuncWrappedInCache<Fn> {
  const { toKey, lru = true } = Object.prototype.toString.call(arg).slice(8, -1) === 'Function'
    ? { toKey: <FuncToKey<Fn>>arg, lru: undefined }
    : <FuncWrapOpts<Fn>>(arg || {});

  const cache = !lru
    ? cacheINF<string, ReturnType<Fn>>()
    : cacheLRU<string, ReturnType<Fn>>(
      Object.prototype.toString.call(lru).slice(8, -1) === 'Number'
        ? <number>lru
        : 10
    );

  func.hasCache = (key: string) => cache.has(key);

  return func;

  function func(this: ThisType<Fn> | void, ...args: Parameters<Fn>): ReturnType<Fn> {
    const key = (toKey || defaultToKey)(this, ...args);
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
