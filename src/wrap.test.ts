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
});
