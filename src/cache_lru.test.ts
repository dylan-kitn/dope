import factory from './cache_lru';

describe('Cache LRU', () => {
  it('Least recently used will be obsoleted firstly', () => {
    const cache = factory<number, number>(3);

    expect(cache.limit).to.be.equal(3);
    expect(cache.size).to.be.equal(0);

    cache.set(1, 1);
    expect(cache.size).to.be.equal(1);
    cache.set(2, 2);
    expect(cache.size).to.be.equal(2);
    cache.set(3, 3);
    expect(cache.size).to.be.equal(3);
    cache.set(4, 4);
    expect(cache.size).to.be.equal(3);

    expect(cache.toJSON()).to.be.eql([
      { key: 4, value: 4 },
      { key: 3, value: 3 },
      { key: 2, value: 2 }
    ]);

    cache.set(5, 5);
    cache.set(3, 6);
    expect(cache.size).to.be.equal(3);

    expect(cache.toJSON()).to.be.eql([
      { key: 3, value: 6 },
      { key: 5, value: 5 },
      { key: 4, value: 4 }
    ]);

    expect(cache.get(5)).to.be.equal(5);
    expect(cache.toJSON()).to.be.eql([
      { key: 5, value: 5 },
      { key: 3, value: 6 },
      { key: 4, value: 4 }
    ]);

    expect(cache.get(4)).to.be.equal(4);
    expect(cache.toJSON()).to.be.eql([
      { key: 4, value: 4 },
      { key: 5, value: 5 },
      { key: 3, value: 6 }
    ]);

    expect(cache.get(4)).to.be.equal(4);
    expect(cache.toJSON()).to.be.eql([
      { key: 4, value: 4 },
      { key: 5, value: 5 },
      { key: 3, value: 6 }
    ]);
  });
  it('Limit changing can shrink cache size to be less than or equal limit immediately', () => {
    const cache = factory<string, string>();

    expect(cache.size).to.be.equal(0);

    cache.set('1', '1');
    cache.set('2', '2');
    cache.set('3', '3');
    cache.set('4', '4');

    expect(cache.size).to.be.equal(4);
    expect(cache.limit).to.be.equal(10);
    
    cache.limit = 6;
    expect(cache.limit).to.be.equal(6);
    expect(cache.toJSON()).to.eql([
      { key: '4', value: '4' },
      { key: '3', value: '3' },
      { key: '2', value: '2' },
      { key: '1', value: '1' }
    ]);

    cache.limit = 3;
    expect(cache.limit).to.be.equal(3);

    expect(cache.size).to.be.equal(3);
    expect(cache.toJSON()).to.eql([
      { key: '4', value: '4' },
      { key: '3', value: '3' },
      { key: '2', value: '2' }
    ]);
  });
  it('Cached data can be all cleared', () => {
    const cache = factory<string, string>();

    expect(cache.size).to.be.equal(0);

    cache.set('1', '1');
    cache.set('2', '2');
    cache.set('3', '3');
    cache.set('4', '4');

    expect(cache.size).to.be.equal(4);
    expect(cache.toJSON()).to.eql([
      { key: '4', value: '4' },
      { key: '3', value: '3' },
      { key: '2', value: '2' },
      { key: '1', value: '1' }
    ]);
    
    cache.clear();
    expect(cache.size).to.be.equal(0);
    expect(cache.toJSON()).to.eql([]);
  });
  it('Cached data can be deleted by key', () => {
    const cache = factory<string, string>();

    expect(cache.size).to.be.equal(0);

    cache.set('1', '1');
    cache.set('2', '2');
    cache.set('3', '3');
    cache.set('4', '4');

    expect(cache.size).to.be.equal(4);
    expect(cache.toJSON()).to.eql([
      { key: '4', value: '4' },
      { key: '3', value: '3' },
      { key: '2', value: '2' },
      { key: '1', value: '1' }
    ]);
    
    expect(cache.del('3')).to.equal('3');
    expect(cache.size).to.be.equal(3);
    expect(cache.toJSON()).to.eql([
      { key: '4', value: '4' },
      { key: '2', value: '2' },
      { key: '1', value: '1' }
    ]);

    expect(cache.del('4')).to.equal('4');
    expect(cache.size).to.be.equal(2);
    expect(cache.toJSON()).to.eql([
      { key: '2', value: '2' },
      { key: '1', value: '1' }
    ]);
    expect(cache.del('1')).to.equal('1');
    expect(cache.size).to.be.equal(1);
    expect(cache.toJSON()).to.eql([
      { key: '2', value: '2' }
    ]);
  });
});
