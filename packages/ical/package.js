Package.describe({
  summary: "generate calendars"
});

Package.on_use(function (api, where) {
	api.use('iron:router');
	api.add_files('ical.js', ['server', 'client']);
});

Npm.depends({'ical-generator': '0.1.10'});
