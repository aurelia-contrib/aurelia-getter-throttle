const test = require('tape');
const {getterThrottle} = require('./index');

function computedFrom(...rest) {
  return function(target, key, descriptor) {
    descriptor.get.dependencies = rest;
    return descriptor;
  };
}

class A {
  constructor() {
    Object.defineProperties(this, {
      fooCount: {
        value: 0,
        writable: true
      },
      barCount: {
        value: 0,
        writable: true
      }
    });
  }

  @getterThrottle()
  @computedFrom('a', 'b')
  get foo() {
    this.fooCount += 1;
    return 'foo';
  }

  @computedFrom('c', 'd')
  @getterThrottle()
  get foo2() {
  }

  @getterThrottle(100)
  get bar() {
    this.barCount += 1;
    return 'bar';
  }
}

test('getterThrottle preserves computed from', t => {
  t.deepEqual(
    Object.getOwnPropertyDescriptor(A.prototype, 'foo').get.dependencies,
    ['a', 'b'],
    'when above computedFrom'
  );
  t.deepEqual(
    Object.getOwnPropertyDescriptor(A.prototype, 'foo2').get.dependencies,
    ['c', 'd'],
    'when below computedFrom'
  );
  t.end();
});

test('getterThrottle caches getter value in same run-loop by default', t => {
  let a = new A();
  let b = new A();

  t.equal(a.foo, 'foo');
  t.equal(a.foo, 'foo');
  t.equal(Object.keys(a).length, 0);
  t.equal(a.fooCount, 1);
  t.equal(b.fooCount, 0);

  setTimeout(() => {
    t.equal(a.foo, 'foo');
    t.equal(a.foo, 'foo');
    t.equal(a.fooCount, 2);
    t.equal(Object.keys(a).length, 0);

    t.equal(b.foo, 'foo');
    t.equal(b.foo, 'foo');
    t.equal(b.fooCount, 1);
    t.equal(Object.keys(b).length, 0);

    t.end();
  }, 20);
});

test('getterThrottle caches getter value within delay', t => {
  let a = new A();

  t.equal(a.bar, 'bar');
  t.equal(a.bar, 'bar');
  t.equal(Object.keys(a).length, 0);
  t.equal(a.barCount, 1);

  setTimeout(() => {
    t.equal(a.bar, 'bar');
    t.equal(a.bar, 'bar');
    t.equal(Object.keys(a).length, 0);
    t.equal(a.barCount, 1);

    setTimeout(() => {
      t.equal(a.bar, 'bar');
      t.equal(a.bar, 'bar');
      t.equal(Object.keys(a).length, 0);
      t.equal(a.barCount, 2);

      t.end();
    }, 100);
  }, 50);
});
