Package.describe({
  name: 'iron:controller',
  summary: 'Controller class for dynamic layouts.',
  version: '1.0.12',
  git: 'https://github.com/iron-meteor/iron-controller'
});

Package.onUse(function (api) {
  api.versionsFrom('3.0.2');

  api.use('underscore');
  api.use('tracker'); // reactivity
  api.use('reactive-dict'); // reactive state variables
  api.use('templating');

  api.use('iron:core@1.0.11');
  api.imply('iron:core');

  api.use('iron:layout@1.0.12');
  api.use('iron:dynamic-template@1.0.12');

  api.addFiles('lib/wait_list.js', 'client');
  api.addFiles('lib/controller.js');
  api.addFiles('lib/controller_server.js', 'server');
  api.addFiles('lib/controller_client.js', 'client');
});

Package.onTest(function (api) {
  api.use('iron:controller');
  api.use('iron:layout');
  api.use('tinytest');
  api.use('test-helpers');
  api.use('tracker');
  api.use('templating');

  api.addFiles('test/controller_test.html', 'client');
  api.addFiles('test/wait_list_test.js', 'client');
  api.addFiles('test/controller_test.js', 'client');
});
