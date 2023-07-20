# @kitn/dope

[![npm version](https://badge.fury.io/js/@kitn%2Fdope.svg)](https://badge.fury.io/js/@kitn%2Fdope.svg)

A function wrapper, cache function procedure.

## Installation

```bash
$ npm install @kitn/dope
```

## Example

This example demonstrates an wrapping for a request function.

```ts
import wrapFnInCache from '@kitn/dope';

export async function getPatternsInCategory(category: string) {
  const res = await fetch(`/api/pattern?category=${category}`);
  return res.json();
}

export const getPatternsInCategoryWithCache = wrapFnInCache(
  getPatternsInCategory,
  (that, category) => category
);

Promise.all([
  getPatternsInCategoryWithCache('A'),
  getPatternsInCategoryWithCache('A'),
  getPatternsInCategoryWithCache('A'),
  getPatternsInCategoryWithCache('B'),
  getPatternsInCategoryWithCache('A'),
  getPatternsInCategoryWithCache('B'),
]).then(ret => {
  const hasACached = getPatternsInCategoryWithCache.hasCache('A');
  const hasBCached = getPatternsInCategoryWithCache.hasCache('B');
  console.log(hasACached, hasBCached, ret);
});

/*
 * Output: true, true, ARRAY(6)
 *
 * fetch two times, one for A, another for B.
 */
```

## License
[ISC](./LICENSE)
