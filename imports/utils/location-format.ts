import { mf } from 'meteor/msgfmt:core';

function coordinateToString(coordinate: number) {
	if (coordinate < 0) {
		return `-${coordinate.toPrecision(6)}`;
	}
	return `+${coordinate.toPrecision(6)}`;
}

export function locationFormat(location: { coordinates: [number, number] }) {
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
