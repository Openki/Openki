v1.0.11 / 2015-10-09
==================
  * Support Meteor 1.2

v1.0.7 / 2015-01-15
==================
  * fix event handler leak by detaching event handlers on destroyed views

v0.4.0 / 2014-08-27
==================
  * Prepare for Blaze changes in 0.9.1
  * fix package.js to use METEOR instead of METEOR-CORE

v0.3.0 / 2014-08-12
==================
  * bump iron:core dep version and add version conflict error
  * fix package to work with new meteor packaging system
  * update examples to use new package name
  * add extend method for inheritance
  * fix comments about view template reactive var

v0.2.1 / 2014-07-25
==================
  * fix if rendering a new template start with fresh data context
  * fix to work with old packaging system for now
  * add reactive controller functions
  * Added a failing test for parent data inheritance.
  * Merge branch 'packaging' of github.com:EventedMind/iron-dynamic-template into packaging
  * add versions.json file
  * Updated package.js
  * add isCreated and isDestroyed init in ctor
  * add fallback to camelCase for template lookup
  * fix destroy() and create() methods to work together
  * fix bug template(value) should return undefined if value hasn't changed
  * add debug messages
  * add some view state properties.
  * add deps dependency for test slice
  * fix package.js to work with packaging system and update readme

v0.1.0 / 7/16/2014
==================
  * Initial package release to atmosphere.
