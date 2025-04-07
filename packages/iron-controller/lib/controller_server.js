Controller.prototype.init = function () {};

Controller.prototype.wait = function () {};

Controller.prototype.ready = function () {
  // for now there are no subscribe calls on the server. All data should
  // be ready synchronously which means this.ready() should always be true.
  return true;
};
