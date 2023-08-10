import type { Func, FuncToKey, FuncWrappedInCache, Key } from './interface';

export function defaultToKey<Fn extends Func, K extends Key>(
  that: FuncWrappedInCache<Fn, FuncToKey<Fn, K>> | ThisType<Fn> | void,
  ...args: Parameters<Fn>
) {
  return JSON.stringify({ that, args }) as K;
}
