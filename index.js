exports.getterThrottle = function (delay) {
  if (!delay) delay = 0;

  return function(target, key, descriptor) {
    var dependencies = descriptor.get.dependencies;
    var originalGetter = descriptor.get;
    var innerPropertyName = '_au_gt_' + key;

    var clearInnerProperty = function() {
      delete this[innerPropertyName];
    };

    descriptor.get = function() {
      if (this.hasOwnProperty(innerPropertyName)) {
        return this[innerPropertyName];
      }

      Object.defineProperty(this, innerPropertyName, {
        value: originalGetter.call(this),
        configurable: true,
        enumerable: false,
        writable: true
      });

      setTimeout(clearInnerProperty.bind(this), delay);

      return this[innerPropertyName];
    };

    if (dependencies) {
      descriptor.get.dependencies = dependencies;
      delete originalGetter.dependencies;
    }

    return descriptor;
  };
};
