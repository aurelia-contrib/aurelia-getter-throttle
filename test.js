import test from 'tape';
import {getterThrottle} from './index';

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
  get foo() {
    this.fooCount += 1;
    return 'foo';
  }

  @getterThrottle(100)
  get bar() {
    this.barCount += 1;
    return 'bar';
  }
}

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
