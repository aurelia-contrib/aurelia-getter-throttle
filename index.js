exports.getterThrottle = function (delay) {
  if (!delay) delay = 0;

  return function(target, key, descriptor) {
    var dependencies = descriptor.get.dependencies;
    var originalGetter = descriptor.get;
    var innerPropertyName = '_throttle_' + key;

    descriptor.get = function() {
      if (this.hasOwnProperty(innerPropertyName)) {
        return this[innerPropertyName];
      }

      this[innerPropertyName] = originalGetter.call(this);

      setTimeout((function() {
        delete this[innerPropertyName];
      }).bind(this), delay);

      return this[innerPropertyName];
    };

    if (dependencies) {
      descriptor.get.dependencies = dependencies;
    }

    return descriptor;
  };
}
