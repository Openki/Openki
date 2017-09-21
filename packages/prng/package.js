Package.describe({
	summary: "seedable pseudo number generator for test purposes"
});

Package.onUse(function (api, where) {
	api.addFiles('prng.js', 'server');
	api.export('Prng');
});

Npm.depends({'seedrandom': '2.4.2'});
