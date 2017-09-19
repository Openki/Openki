var seedrandom = Npm.require('seedrandom');
Prng = function(staticseed) {
	return seedrandom(Meteor.settings.prng === "static" ? staticseed : undefined);
};
