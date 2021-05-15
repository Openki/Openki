import { Regions } from '/imports/api/regions/regions';
import moment from 'moment-timezone';

/**
 * Serialize local time for mongo
 *
 * References to future local time are stored as ISO 8601 date strings
 * with no seconds and no timezone offset.
 *
 * Example string as stored in the DB:
 *
 * "2016-06-07T09:30"
 *
 * This means some points in time (e.g. when DST ends) will be impossible
 * to express unambiguously. This is acceptable as we don't have the UI to
 * handle these either.
 *
 * Rationale for the use of this format:
 * Mongo has no concept of localized dates. All date objects are stored in UTC.
 * This poses a problem when we try to pin an event to a future local time in a
 * timezone.
 *
 * Due to frequent changes in timezones, if we store the date as UTC it might
 * acquire an offset at some point in the future when local time changes
 * relative to UTC. We would have to correct the time in concert with
 * everybody else (our libraries and the timezone info of the browsers of our
 * users). This is infeasible. Thus future dates must be stored as local time.
 */

const LocalTime = {};

/**
 * @param {string} regionId
 */
LocalTime.zone = function (regionId) {
	const region = Regions.findOne(regionId);
	if (!region) {
		throw new Error(`Unable to load region ${regionId}`);
	}

	const { tz } = region;

	return {
		/** @param {string} date */
		fromString(date) {
			return moment.tz(date, tz);
		},
		/** @param {Date} date */
		toString(date) {
			return moment.tz(date, tz).format('YYYY-MM-DD[T]HH:mm');
		},
		/** @param {Date} date */
		at(date) {
			return moment.tz(date, tz);
		},
	};
};

/**
 * Turn a moment object into a local date string without time offset
 * @param {Date | moment.Moment} date
 */
LocalTime.toString = function (date) {
	return moment(date).format('YYYY-MM-DD[T]HH:mm');
};

/**
 * Read local date from string
 *
 * Note that the returned date will be faux UTC.
 *
 * @param {string} dateStr
 */
LocalTime.fromString = function (dateStr) {
	return moment.utc(dateStr);
};

LocalTime.now = function () {
	return moment().add(moment().utcOffset(), 'minutes');
};

LocalTime.toGlobal = function (time, regionId) {
	const region = Regions.findOne(regionId);
	if (!region) {
		throw new Error('Unable to load region');
	}
	const { tz } = region;

	return moment.tz(moment(time).format('YYYY-MM-DD[T]HH:mm'), tz);
};

LocalTime.fromDate = function (time, regionId) {
	const region = Regions.findOne(regionId);
	if (!region) {
		throw new Error('Unable to load region');
	}
	const { tz } = region;

	return moment(time).tz(time, tz).format('YYYY-MM-DD[T]HH:mm');
};

export default LocalTime;
