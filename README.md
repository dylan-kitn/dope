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

Another example demonstrates an wrapping for two member method of a class.

```ts
import wrapFnInCache from '@kitn/dope';

class Demo {
  async getById(id: number) {
    const res = await fetch(`/api/demo?id=${id}`);
    return res.json();
  }
  async getByName(name: string) {
    const res = await fetch(`/api/demo?name=${name}`);
    return res.json();
  }
}

class DemoWithCache {
  getByIdWithCache = wrapFnInCache(Demo.prototype.getById, (that, id) => id);
  getByIdWithCacheRerun = this.getByIdWithCache.forceRerun;
  getByNameWithCache = wrapFnInCache(Demo.prototype.getByName, (that, name) => name);
  getByNameWithCacheRerun = this.getByNameWithCache.forceRerun;
}

const demo = new DemoWithCache();

Promise.all([
  demo.getByIdWithCache(10000),
  demo.getByIdWithCache(10000),
  demo.getByIdWithCache(10001),
  demo.getByIdWithCache(10001),
  demo.getByIdWithCacheRerun(10000),
  demo.getByNameWithCache('A'),
  demo.getByNameWithCache('A'),
  demo.getByNameWithCache('B'),
  demo.getByNameWithCache('B'),
  demo.getByNameWithCacheRerun('A'),
]).then(ret => {
  console.log({
    ret,
    has10000Cached: demo.getByIdWithCache.hasCache(10000),
    has10001Cached: demo.getByIdWithCache.hasCache(10001),
    hasACached: demo.getByNameWithCache.hasCache('A'),
    hasBCached: demo.getByNameWithCache.hasCache('B')
  });
});

/*
 * Output:
 *   ret ARRAY(10)
 *   has10000Cached true
 *   has10001Cached true
 *   hasACached true
 *   hasBCached true
 *
 * fetch 6 times in total.
 */
```

## License
[ISC](./LICENSE)
