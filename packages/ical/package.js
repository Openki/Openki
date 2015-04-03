Package.describe({
  summary: "pull ical-generator"
});

Package.on_use(function (api, where) {
	api.use('iron:router');
	api.add_files('ical.js', 'server');
});

Npm.depends({'ical-generator': '0.1.10'});
