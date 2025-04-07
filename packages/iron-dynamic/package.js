Package.describe({
  name: 'iron:dynamic-template',
  summary: 'Dynamically create and update templates and their data contexts.',
  version: '1.0.12',
  git: 'https://github.com/iron-meteor/iron-dynamic-template'
});

Package.onUse(function (api) {
  api.versionsFrom('3.0.2');

  api.use('blaze');
  api.use('underscore');
  api.use('ui');
  api.use('jquery');
  api.use('tracker');
  api.use('reactive-var');
  api.use('templating');
  api.use('random');

  api.use('iron:core@1.0.11');
  api.imply('iron:core');

  api.addFiles('version_conflict_error.js');
  api.addFiles('dynamic_template.html');
  api.addFiles('dynamic_template.js');
  api.addFiles('blaze_overrides.js');
});

Package.onTest(function (api) {
  api.versionsFrom('3.0.2');

  api.use('iron:dynamic-template');
  api.use('templating');
  api.use('tinytest');
  api.use('test-helpers');
  api.use('blaze');
  api.use('deps');

  api.addFiles('dynamic_template_test.html', 'client');
  api.addFiles('dynamic_template_test.js', 'client');
});
