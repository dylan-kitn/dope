export interface Func<ARGS extends any[] = any[], RET = any> {
  (...args: ARGS): RET;
}
export type Key = string | number;
export interface FuncToKey<Fn extends Func, K extends Key> {
  (that: FuncWrappedInCache<Fn, FuncToKey<Fn, K>> | ThisType<Fn> | void, ...args: Parameters<Fn>): K;
}
export interface FuncWrapOpts<Fn extends Func, FnToKey extends FuncToKey<Fn, Key>> {
  toKey?: FnToKey;
  lru?: boolean | number;
}
export interface FuncWrappedInCache<Fn extends Func, FnToKey extends FuncToKey<Fn, Key>> {
  (this: ThisType<Fn> | void, ...args: Parameters<Fn>): ReturnType<Fn>;
  hasCache: (key: ReturnType<FnToKey>) => boolean;
  rmFromCache: (key: ReturnType<FnToKey>) => void;
  clearCache: () => void;
  forceRerun: (this: FuncWrappedInCache<Fn, FnToKey> | ThisType<Fn> | void, ...args: Parameters<Fn>) => ReturnType<Fn>;
}
export interface Cache<K, V> {
  readonly size: number;
  limit: number;
  set(key: K, value: V): void;
  has(key: K): boolean;
  get(key: K): V | undefined;
  find(key: K): V | undefined;
  del(key: K): V | undefined;
  clear(): void;
  keys(): Array<K>;
  values(): Array<V>;
  entries(): Array<[K, V]>;
  toJSON(): Array<{ key: K; value: V }>;
}
