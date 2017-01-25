Package.describe({
	name: 'fixtures',
	version: '0.0.1',
	summary: 'Filler data for dev setups',
});

Package.onUse(function(api) {
	api.versionsFrom('1.4.2.3');
	api.use('ecmascript');
	api.use('prng');
	api.mainModule('server/fixtures.js', 'server');
});

