import type { Func, FuncToKey, FuncWrappedInCache, Key, ParametersOverload } from './interface';

export function defaultToKey<Fn extends Func, K extends Key>(
  args: ParametersOverload<Fn>,
  that: FuncWrappedInCache<Fn, FuncToKey<Fn, K>> | ThisType<Fn> | void
) {
  return JSON.stringify({ that, args }) as K;
}
