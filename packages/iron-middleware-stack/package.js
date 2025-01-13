Package.describe({
  name: 'iron:middleware-stack',
  summary: 'Client and server middleware support inspired by Connect.',
  version: '1.1.0',
  git: 'https://github.com/iron-meteor/iron-middleware-stack'
});

Package.onUse(function (api) {
  api.versionsFrom('3.0.2');

  api.use('underscore');
  api.use('ejson');

  api.use('iron:core@1.0.11');
  api.imply('iron:core');

  api.use('iron:url@1.0.11');

  api.addFiles('lib/handler.js');
  api.addFiles('lib/middleware_stack.js');
  api.export('Handler', {testOnly: true});
});

Package.onTest(function (api) {
  api.use('iron:middleware-stack');
  api.use('tinytest');
  api.use('test-helpers');
  api.addFiles('test/handler_test.js');
  api.addFiles('test/middleware_stack_test.js');
});
