import type { Func } from './interface';

export function defaultToKey<Fn extends Func>(
  that: ThisType<Fn> | void,
  ...args: Parameters<Fn>
) {
  return JSON.stringify({ that, args });
}
