import { wrapFnInCache } from './wrap';

describe('Wrap', () => {
  it('Wrap function in Cache', () => {
    expect(wrapFnInCache).to.be.a('function');

    const add = sinon.spy(function(m: number, n: number) {
      return m + n;
    });

    const addWithCache = wrapFnInCache(add, {
      toKey: ([m, n]) => {
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
      toKey: ([m, n]) => {
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
      toKey: ([m, n]) => {
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
      toKey: ([m, n]) => {
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
  it('Wraped async function can check and modify cache', async () => {
    const add = sinon.spy(async function(m: number, n: number) {
      return new Promise<number>(resolve => {
        setTimeout(() => {
          resolve(m + n);
        }, 0);
      });
    });

    const addWithCache = wrapFnInCache(add, {
      toKey: ([m, n]) => {
        return `${m}+${n}`;
      },
      lru: false
    });

    expect(await addWithCache(1, 1)).to.equal(2);
    expect(await addWithCache(2, 2)).to.equal(4);

    expect(add.calledTwice).to.be.true;
    expect(addWithCache.hasCache('1+1')).to.be.true;
    expect(addWithCache.hasCache('2+2')).to.be.true;

    addWithCache.rmFromCache('1+1');
    expect(addWithCache.hasCache('1+1')).to.be.false;
    expect(addWithCache.hasCache('2+2')).to.be.true;

    addWithCache.clearCache();
    expect(addWithCache.hasCache('1+1')).to.be.false;
    expect(addWithCache.hasCache('2+2')).to.be.false;
    
    expect(await addWithCache(2, 2)).to.equal(4);
    expect(addWithCache.hasCache('1+1')).to.be.false;
    expect(addWithCache.hasCache('2+2')).to.be.true;
    expect(add.calledThrice).to.be.true;
  });
  it('Wraped async function can force rerun', async () => {
    const add = sinon.spy(async function(m: number, n: number) {
      return new Promise<number>(resolve => {
        setTimeout(() => {
          resolve(m + n);
        }, 0);
      });
    });

    const addWithCache = wrapFnInCache(add, {
      toKey: ([m, n]) => {
        return `${m}+${n}`;
      },
      lru: false
    });

    expect(await addWithCache(1, 1)).to.equal(2);
    expect(add.calledOnce).to.be.true;
    expect(addWithCache.hasCache('1+1')).to.be.true;
    expect(await addWithCache(1, 1)).to.equal(2);
    expect(add.calledOnce).to.be.true;
    expect(addWithCache.hasCache('1+1')).to.be.true;
    expect(await addWithCache.forceRerun(1, 1)).to.equal(2);
    expect(add.calledTwice).to.be.true;
    expect(addWithCache.hasCache('1+1')).to.be.true;
  });
  it('Can wrap async member method', async () => {
    const add = sinon.spy(function(m: number, n: number) {
      return new Promise<number>(resolve => {
        setTimeout(() => {
          resolve(m + n);
        }, 0);
      });
    });

    class Demo {
      private a: number;
      private b: number;
      constructor(a: number, b: number) {
        this.a = a;
        this.b = b;
      }
      add() {
        return add(this.a, this.b);
      }
      toJSON() {
        return `${this.a}+${this.b}`;
      }
    }

    class DemoWithCache extends Demo {
      addWithCache = wrapFnInCache(Demo.prototype.add);
      addWithCacheForceRerun = this.addWithCache.forceRerun;
    }

    const inst = new DemoWithCache(1, 1);

    expect(await inst.addWithCache()).to.equal(2);
    expect(add.calledOnce).to.be.true;
    expect(await inst.addWithCache()).to.equal(2);
    expect(add.calledOnce).to.be.true;
    expect(await inst.addWithCacheForceRerun()).to.equal(2);
    expect(add.calledTwice).to.be.true;

    const key = JSON.stringify({ that: inst, args: [] });
    expect(inst.addWithCache.hasCache(key)).to.be.true;
  });
  it('Can wrap multiple async member methods', async () => {
    const add1 = sinon.spy(function(m: number) {
      return new Promise<number>(resolve => {
        setTimeout(() => {
          resolve(m + 1);
        }, 0);
      });
    });
    const add2 = sinon.spy(function(m: string) {
      return new Promise<string>(resolve => {
        setTimeout(() => {
          resolve(m + 's');
        }, 0);
      });
    });

    class Demo {
      async addById(id: number) {
        return add1(id);
      }
      async addByName(name: string) {
        return add2(name);
      }
    }

    class DemoWithCache extends Demo {
      addByIdWithCache = wrapFnInCache(Demo.prototype.addById, ([id]) => id);
      addByIdWithCacheForceRerun = this.addByIdWithCache.forceRerun;
      addByNameWithCache = wrapFnInCache(Demo.prototype.addByName, ([name]) => name);
      addByNameWithCacheForceRerun = this.addByNameWithCache.forceRerun;
    }

    const inst = new DemoWithCache();

    expect(await inst.addByIdWithCache(1)).to.equal(2);
    expect(add1.calledOnce).to.be.true;
    expect(await inst.addByIdWithCache(1)).to.equal(2);
    expect(add1.calledOnce).to.be.true;
    expect(await inst.addByIdWithCacheForceRerun(1)).to.equal(2);
    expect(add1.calledTwice).to.be.true;
    expect(await inst.addByNameWithCache('n')).to.equal('ns');
    expect(add2.calledOnce).to.be.true;
    expect(await inst.addByNameWithCache('n')).to.equal('ns');
    expect(add2.calledOnce).to.be.true;
    expect(await inst.addByNameWithCacheForceRerun('n')).to.equal('ns');
    expect(add2.calledTwice).to.be.true;

    expect(inst.addByIdWithCache.hasCache(1)).to.be.true;
    expect(inst.addByNameWithCache.hasCache('n')).to.be.true;
  });
});
