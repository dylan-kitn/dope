export type OverloadsRecursive<TOverload, TPartialOverload = unknown> =
  TOverload extends (...args: infer TArgs) => infer TReturn
    ? TPartialOverload extends TOverload ? never :
      | OverloadsRecursive<
          TPartialOverload & TOverload,
          TPartialOverload & ((...args: TArgs) => TReturn) & Pick<TOverload, keyof TOverload>
        >
      | ((...args: TArgs) => TReturn)
    : never;
export type Overloads<TOverload extends (...args: any[]) => any> = Exclude<
  OverloadsRecursive<(() => never) & TOverload>,
  TOverload extends () => never ? never : () => never
>;
export type ParametersOverload<T extends (...args: any[]) => any> = Parameters<Overloads<T>>
export type ReturnTypeOverload<T extends (...args: any[]) => any> = ReturnType<Overloads<T>>

export interface Func<ARGS extends any[] = any[], RET = any> {
  (...args: ARGS): RET;
}
export type Key = string | number;
export interface FuncToKey<Fn extends Func, K extends Key> {
  (args: ParametersOverload<Fn>, that: FuncWrappedInCache<Fn, FuncToKey<Fn, K>> | ThisType<Fn> | void): K;
}
export interface FuncWrapOpts<Fn extends Func, FnToKey extends FuncToKey<Fn, Key>> {
  toKey?: FnToKey;
  lru?: boolean | number;
}
export type FuncWrappedInCache<Fn extends Func, FnToKey extends FuncToKey<Fn, Key>> = Fn & {
  hasCache: (key: ReturnType<FnToKey>) => boolean;
  rmFromCache: (key: ReturnType<FnToKey>) => void;
  clearCache: () => void;
  forceRerun: Fn;
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
