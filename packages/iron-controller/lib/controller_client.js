/*****************************************************************************/
/* Imports */
/*****************************************************************************/
var Layout = Iron.Layout;
var debug = Iron.utils.debug('iron:controller');
var defaultValue = Iron.utils.defaultValue;

/*****************************************************************************/
/* Private */
/*****************************************************************************/
var bindData = function (value, thisArg) {
  return function () {
    return (typeof value === 'function') ? value.apply(thisArg, arguments) : value;
  };
};

/*****************************************************************************/
/* Controller Client */
/*****************************************************************************/
/**
 * Client specific init code.
 */
Controller.prototype.init = function (options) {
  this._waitlist = new WaitList;
  this.state = new ReactiveDict;
};

/**
 * Insert the controller's layout into the DOM.
 */
Controller.prototype.insert = function (options) {
  return this._layout.insert.apply(this._layout, arguments);
};

/**
 * Add an item to the waitlist.
 */
Controller.prototype.wait = function (fn) {
  var self = this;

  if (!fn)
    // it's possible fn is just undefined but we'll just return instead
    // of throwing an error, to make it easier to call this function
    // with waitOn which might not return anything.
    return;

  if (_.isArray(fn)) {
    _.each(fn, function eachWait (fnOrHandle) {
      self.wait(fnOrHandle);
    });
  } else if (fn.ready) {
    this._waitlist.wait(function () { return fn.ready(); });
  } else {
    this._waitlist.wait(fn);
  }

  return this;
};

/**
 * Returns true if all items in the waitlist are ready.
 */
Controller.prototype.ready = function () {
  return this._waitlist.ready();
};

/**
 * Clean up the controller and stop the waitlist.
 */
Controller.prototype.stop = function () {
  this._waitlist.stop();
};
