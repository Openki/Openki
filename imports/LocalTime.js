/** Serialize local time for mongo
  *
  * References to future wall-clock time are stored as ISO 8601 date strings
  * with no seconds and no timezone offset.
  *
  * Example string as stored in the DB:
  *
  * "2016-06-07T09:30"
  *
  * This means some points in time (e.g. when DST starts) will be impossible
  * to express unambiguously. This is acceptable as we don't have the UI to
  * handle these either.
  *
  * Rationale for the use of this format:
  * Mongo has no concept of localized dates. All date objects are stored in UTC.
  * This poses a problem when we try to pin an event to a wall-clock time in a
  * timezone.
  *
  * Due to frequent changes in timezones, if we store the date as UTC it might
  * acquire an offset at some point in the future when local time changes
  * relative to UTC. We would have to correct the time in concert with
  * everybody else (our libraries and the timezone info of the browsers of our
  * users). This is infeasible. Thus future dates must be stored as local time.
  */

import moment from 'moment-timezone';

LocalTime = {};

/** Turn a moment object into a local date string without time offset
  */
LocalTime.toString = function(date) {
	return moment(date).format('YYYY-MM-DD[T]HH:mm');
};

/** Read local date from string
  *
  * Note that the returned date will be faux UTC if you don't provide the tz
  * parameter. As long as you don't try to compare it to other dates or display
  * it in another timezone this will pose few problems.
  */
LocalTime.fromString = function(dateStr, tz) {
	// Because the string is written in ISO 8601 form, moment can read it
	// without us having to specify the format.
	if (tz) {
		return moment.tz(dateStr, tz);
	} else {
		return moment.utc(dateStr);
	}
};

/** Return the current local time for given region as moment object that thinks it's UTC
  */
LocalTime.regionTime = function(regionId) {
	var tz = 'Antarctica/Troll'; // Happens to be "+0 UTC" and looks sufficiently wrong that it wouldn't be mistaken for actual data
	var region = Regions.findOne(regionId);
	if (region) {
		tz = region.tz;
	}

	var now = moment.tz(tz);
	var fauxUTC = moment.utc(now).add(now.utcOffset(), 'minutes');
	return fauxUTC;
};

LocalTime.now = function() {
	return moment().add(moment().utcOffset(), 'minutes');
};

LocalTime.toGlobal = function(time, regionId) {
	var region = Regions.findOne(regionId);
	if (!region) {
		throw "Unable to load region";
	}
	tz = region.tz;

	return moment.tz(moment(time).format("YYYY-MM-DD[T]HH:mm"), tz);
};

LocalTime.fromGlobal = function(time, regionId) {
	var region = Regions.findOne(regionId);
	if (!region) {
		throw "Unable to load region";
	}
	tz = region.tz;

	return moment.utc(moment.tz(time, tz).format("YYYY-MM-DD[T]HH:mm"));
};