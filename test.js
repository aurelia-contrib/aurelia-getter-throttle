import test from 'tape';
import {getterThrottle} from './index';

class A {
  constructor() {
    this.fooCount = 0;
    this.barCount = 0;
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

test('getterThrottle caches getter value in same runloop by default', t => {
  let a = new A();

  t.equal(a.foo, 'foo');
  t.equal(a.foo, 'foo');
  t.equal(a.fooCount, 1);

  setTimeout(() => {
    t.equal(a.foo, 'foo');
    t.equal(a.foo, 'foo');
    t.equal(a.fooCount, 2);
    t.end();
  }, 20);
});

test('getterThrottle caches getter value within delay', t => {
  let a = new A();

  t.equal(a.bar, 'bar');
  t.equal(a.bar, 'bar');
  t.equal(a.barCount, 1);

  setTimeout(() => {
    t.equal(a.bar, 'bar');
    t.equal(a.bar, 'bar');
    t.equal(a.barCount, 1);

    setTimeout(() => {
      t.equal(a.bar, 'bar');
      t.equal(a.bar, 'bar');
      t.equal(a.barCount, 2);
      t.end();
    }, 100);
  }, 50);
});
