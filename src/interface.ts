export interface Func<ARGS extends any[] = any[], RET = any> {
  (...args: ARGS): RET;
}
export interface FuncWrappedInCache<Fn extends Func> {
  (this: ThisType<Fn> | void, ...args: Parameters<Fn>): ReturnType<Fn>;
  hasCache: (key: string) => boolean;
}
export interface FuncToKey<Fn extends Func> {
  (that: ThisType<Fn> | void, ...args: Parameters<Fn>): string;
}
export interface FuncWrapOpts<Fn extends Func> {
  toKey?: FuncToKey<Fn>;
  lru?: boolean | number;
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
