Package.describe({
  name: 'router-autoscroll',
  version: '0.1.8',
  summary: 'Smart management of scroll position across route changes for Iron and Flow Router',
  git: 'https://github.com/okgrow/router-autoscroll',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0.3.1');
  api.use('promise@0.4.1');
  api.use('reactive-dict');
  api.use('reload');
  api.use('iron:router@1.0.7', 'client', {weak: true});
  api.addFiles('client/router-autoscroll.js', 'client');
  api.export('RouterAutoscroll', 'client');
});

