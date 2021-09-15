import { i18n } from '/imports/startup/both/i18next';

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

	return i18n('location.format', '{LAT} {LON}', {
		LAT: coordinateToString(location.coordinates[1]),
		LON: coordinateToString(location.coordinates[0]),
	});
}

export default locationFormat;
