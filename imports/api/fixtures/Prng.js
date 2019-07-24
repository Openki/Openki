import seedrandom from 'seedrandom';

const Prng = function (staticseed) {
	return seedrandom(Meteor.settings.prng === 'static' ? staticseed : undefined);
};

export default Prng;
