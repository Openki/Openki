import Courses from '/imports/api/courses/courses';
import Events from '/imports/api/events/events';
import Log from '/imports/api/log/log';
import Regions from '/imports/api/regions/regions';

import LocalTime from '/imports/utils/local-time';

const notificationEvent = {};

/** Record the intent to send event notifications
  *
  * @param      {ID} eventID   - event to announce
  * @param {Boolean} isNew     - whether the event is a new one
  * @param {String}  additionalMessage - custom message
  */
// eslint-disable-next-line func-names
notificationEvent.record = function (eventId, isNew, additionalMessage) {
	check(eventId, String);
	check(isNew, Boolean);
	const event = Events.findOne(eventId);
	if (!event) throw new Meteor.Error(`No event for${eventId}`);

	// What do we do when we receive an event which is not attached to a course?
	// For now when we don't have a course we just go through the motions but
	// the recipient list will be empty.
	let course = false;
	if (event.courseId) course = Courses.findOne(event.courseId);

	const body = {};
	body.new = isNew;
	body.eventId = event._id;
	body.additionalMessage = additionalMessage;

	// The list of recipients is built right away so that only course members
	// at the time of event creation will get the notice even if sending is
	// delayed.
	body.recipients = [];
	if (course) {
		body.recipients = _.pluck(course.members, 'user');
		body.courseId = course._id;
	}

	body.model = 'Event';

	Log.record('Notification.Send', [course._id], body);
};

// eslint-disable-next-line func-names
notificationEvent.Model = function (entry) {
	const event = Events.findOne(entry.body.eventId);
	let course = false;
	if (event && event.courseId) {
		course = Courses.findOne(event.courseId);
	}

	let region = false;
	if (event && event.region) {
		region = Regions.findOne(event.region);
	}

	return {
		vars(userLocale) {
			if (!event) throw new Error('Event does not exist (0.o)');
			if (!course) throw new Error('Course does not exist (0.o)');
			if (!region) throw new Error('Region does not exist (0.o)');

			// Show dates in local time and in users locale
			const regionZone = LocalTime.zone(event.region);

			const startMoment = regionZone.at(event.start);
			startMoment.locale(userLocale);

			const endMoment = regionZone.at(event.end);
			endMoment.locale(userLocale);

			const subjectvars = {
				TITLE: event.title.substr(0, 30),
				DATE: startMoment.format('LL'),
			};

			let subject;
			if (entry.new) {
				subject = mf('notification.event.mail.subject.new', subjectvars, 'On {DATE}: {TITLE}', userLocale);
			} else {
				subject = mf('notification.event.mail.subject.changed', subjectvars, 'Fixed {DATE}: {TITLE}', userLocale);
			}

			const { venue } = event;
			let venueLine = false;
			if (venue) {
				venueLine = [venue.name, venue.address].filter(Boolean).join(', ');
			}

			return (
				{
					event,
					course,
					eventDate: startMoment.format('LL'),
					eventStart: startMoment.format('LT'),
					eventEnd: endMoment.format('LT'),
					venueLine,
					regionName: region.name,
					timeZone: endMoment.format('z'), // Ignoring the possibility that event start could have a different offset like when going from CET to CEST
					eventLink: Router.url('showEvent', event),
					courseLink: Router.url('showCourse', course),
					calLink: Router.url('calEvent', event),
					new: entry.body.new,
					subject,
					additionalMessage: entry.body.additionalMessage,
				}
			);
		},
		template: 'notificationEventMail',
	};
};

export default notificationEvent;
