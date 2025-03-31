Package.describe({
  name: 'iron:layout',
  summary: 'Dynamic layouts which enable rendering dynamic templates into regions on a page.',
  version: '1.0.12',
  git: 'https://github.com/iron-meteor/iron-layout'
});

Package.onUse(function (api) {
  api.versionsFrom('3.0.2');

  // so our default_layout gets compiled
  api.use('templating');
  api.use('blaze');

  // some utils
  api.use('underscore');
  api.use('tracker'); // for Deps

  api.use('iron:core@1.0.11');
  api.imply('iron:core');

  // dynamic templates
  api.use('iron:dynamic-template@1.0.12');

  // if you use iron-layout you should get iron-dynamic-template for free!
  api.imply('iron:dynamic-template');

  // error messages to remove old packages
  api.use('cmather:blaze-layout@0.2.5', {weak: true});
  api.use('cmather:iron-layout@0.2.0', {weak: true});

  api.addFiles('version_conflict_errors.js');
  api.addFiles('default_layout.html');
  api.addFiles('layout.js');
});

Package.onTest(function (api) {
  api.versionsFrom('3.0.2');

  api.use('iron:layout');
  api.use('tinytest');
  api.use('test-helpers');
  api.use('templating');
  api.use('deps');

  api.addFiles('layout_test.html', 'client');
  api.addFiles('layout_test.js', 'client');
});
