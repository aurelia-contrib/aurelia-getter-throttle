# aurelia-getter-throttle

Throttle getter to make Aurelia rendering efficient.

If you use a getter property multiple times in html template, Aurelia will call the getter multiple times even within one rendering cycle, no matter whether you use computedFrom or dirty-check properties.

The behaviour is costly if your getter is not cheap to run.

This `getterThrottle` decorator works for both computedFrom and dirty-check properties, reduces the number of calls (Aurelia calls and your calls) to one for every rendering cycle.

Usage:

```sh
npm i aurelia-getter-throttle # or yarn add aurelia-getter-throttle
```

```js
import {getterThrottle} from 'aurelia-getter-throttle';

export class YourComponent {
  // the order of decorators doesn't matter,
  // you can place getterThrottle above or below computedFrom
  @computedFrom('one', 'two')
  @getterThrottle()
  get foo() {
    // ...
  }

  // for dirty-check property
  @getterThrottle()
  get bar() {
    // ...
  }

  // the default dirty-check runs every 120ms.
  // you can effectively make it longer, without altering Aurelia core behaviour.
  @getterThrottle(500)
  get bar() {
    // ...
  }
}
```

But be careful with the cached value:

```js
@getterThrottle()
get hasError() {
  return !!this.errors;
}

someLogic() {
  this.errors = null;
  // hasError is false and cached
  if (this.hasError) {}

  // ...

  this.errors = something;
  // hasError is still false, as it's cached.
  // you'd better check this.errors directly.
  if (this.hasError) {}
}
```