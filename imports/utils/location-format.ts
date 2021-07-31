import { mf } from 'meteor/msgfmt:core';

/**
 * @param {number} coordinate
 */
function coordinateToString(coordinate) {
	if (coordinate < 0) {
		return `-${coordinate.toPrecision(6)}`;
	}
	return `+${coordinate.toPrecision(6)}`;
}
/**
 * @param {{coordinates:[number,number]}} location
 */
export function locationFormat(location) {
	if (!location?.coordinates) {
		return undefined;
	}

	return mf(
		'location.format',
		{
			LAT: coordinateToString(location.coordinates[1]),
			LON: coordinateToString(location.coordinates[0]),
		},
		'{LAT} {LON}',
	);
}

export default locationFormat;
