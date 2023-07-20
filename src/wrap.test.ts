import { wrapFnInCache } from './wrap';

describe('Wrap', () => {
  it('Wrap function in Cache', () => {
    expect(wrapFnInCache).to.be.a('function');

    const add = sinon.spy(function(m: number, n: number) {
      return m + n;
    });

    const addWithCache = wrapFnInCache(add, {
      toKey: (_that, m, n) => {
        return `${m}+${n}`;
      },
      lru: false
    });
    const ret0 = addWithCache(10, 10);
    const ret1 = addWithCache(10, 10);

    expect(ret0).to.equal(20);
    expect(ret1).to.equal(20);
    expect(add.calledOnce).to.be.true;
    
    const ret2 = addWithCache(10, 20);
    const ret3 = addWithCache(10, 10);
    expect(ret2).to.equal(30);
    expect(ret3).to.equal(20);
    expect(add.calledTwice).to.be.true;
  });
  it('Wraped function can throw error', () => {
    const err = 'yummy';
    const add = sinon.spy(function(m: number, n: number) {
      if (m === 10 && n === 10) {
        throw new Error(err);
      }
      return m + n;
    });

    const addWithCache = wrapFnInCache(add, {
      toKey: (_that, m, n) => {
        return `${m}+${n}`;
      },
      lru: false
    });
    expect(addWithCache(1, 1)).to.equal(2);
    expect(() => addWithCache(10, 10)).to.throw(err);
    expect(add.calledTwice).to.be.true;
    expect(addWithCache.hasCache('1+1')).to.be.true;
    expect(addWithCache.hasCache('10+10')).to.be.false;
  });
  it('Wrap async function in Cache', async () => {
    expect(wrapFnInCache).to.be.a('function');

    const add = sinon.spy(async function(m: number, n: number) {
      return new Promise<number>(resolve => {
        setTimeout(() => {
          resolve(m + n);
        }, 0);
      });
    });

    const addWithCache = wrapFnInCache(add, {
      toKey: (_that, m, n) => {
        return `${m}+${n}`;
      },
      lru: false
    });
    const ret0 = await addWithCache(10, 10);
    const ret1 = await addWithCache(10, 10);

    expect(ret0).to.equal(20);
    expect(ret1).to.equal(20);
    expect(add.calledOnce).to.be.true;
    
    const ret2 = await addWithCache(10, 20);
    const ret3 = await addWithCache(10, 10);
    expect(ret2).to.equal(30);
    expect(ret3).to.equal(20);
    expect(add.calledTwice).to.be.true;
  });
  it('Wraped async function can throw error', async () => {
    const err = 'yummy';
    const add = sinon.spy(async function(m: number, n: number) {
      return new Promise<number>((resolve, reject) => {
        setTimeout(() => {
          if (m === 10 && n === 10) {
            reject(err);
          }
          resolve(m + n);
        }, 0);
      });
    });

    const addWithCache = wrapFnInCache(add, {
      toKey: (_that, m, n) => {
        return `${m}+${n}`;
      },
      lru: false
    });

    expect(await addWithCache(1, 1)).to.equal(2);

    let error: unknown;
    try {
      await addWithCache(10, 10);
    } catch (e) {
      error = e;
    }
    expect(error).to.equal(err);
    expect(add.calledTwice).to.be.true;
    expect(addWithCache.hasCache('1+1')).to.be.true;
    expect(addWithCache.hasCache('10+10')).to.be.false;
  });
});
