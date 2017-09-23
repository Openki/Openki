import seedrandom from 'seedrandom';
export default Prng = function(staticseed) {
	return seedrandom(Meteor.settings.prng === "static" ? staticseed : undefined);
};
