import seedrandom from 'seedrandom';

import { PrivateSettings } from '/imports/utils/PrivateSettings';

const Prng = function (staticseed) {
	return seedrandom(PrivateSettings.prng === 'static' ? staticseed : undefined);
};

export default Prng;
