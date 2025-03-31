/*****************************************************************************/
/* Imports */
/*****************************************************************************/
var assert = Iron.utils.assert;
var get = Iron.utils.get;

/*****************************************************************************/
/* Blaze Overrides */
/*****************************************************************************/
/**
 * Adds ability to inject lookup hosts into views that can participate in
 * property lookup. For example, iron:controller or iron:component could make
 * use of this to add methods into the lookup chain. If the property is found,
 * a function is returned that either returns the property value or the result
 * of calling the function (bound to the __lookupHost__).
 */
var origLookup = Blaze.View.prototype.lookup;
Blaze.View.prototype.lookup = function (name /*, args */) {
  var host;

  host = DynamicTemplate.findLookupHostWithHelper(Blaze.getView(), name);

  if (host) {
    return function callLookupHostHelper (/* args */) {
      var helper = get(host, 'constructor', '_helpers', name);
      var args = [].slice.call(arguments);
      return (typeof helper === 'function') ? helper.apply(host, args) : helper;
    }
  } else {
    return origLookup.apply(this, arguments);
  }
};
