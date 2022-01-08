import { check, Match } from 'meteor/check';
import { Router } from 'meteor/iron:router';
import { Meteor } from 'meteor/meteor';
import { i18n } from '/imports/startup/both/i18next';
import { Spacebars } from 'meteor/spacebars';

import { CourseModel, Courses } from '/imports/api/courses/courses';
import { Events } from '/imports/api/events/events';
import { Log } from '/imports/api/log/log';
import { RegionModel, Regions } from '/imports/api/regions/regions';
import { UserModel } from '/imports/api/users/users';

import LocalTime from '/imports/utils/local-time';
import { getSiteName } from '/imports/utils/getSiteName';

interface Body {
	new: boolean;
	eventId: string;
	additionalMessage: string | undefined;
	recipients: string[];
	courseId: string;
	model: string;
}

/**
 * Record the intent to send event notifications
 * @param eventId event id to announce
 * @param isNew whether the event is a new one
 * @param additionalMessage custom message
 */
export function record(eventId: string, isNew: boolean, additionalMessage?: string) {
	check(eventId, String);
	check(isNew, Boolean);
	check(additionalMessage, Match.Optional(String));

	const event = Events.findOne(eventId);
	if (!event) {
		throw new Meteor.Error(`No event for ${eventId}`);
	}

	// What do we do when we receive an event which is not attached to a course?
	// For now when we don't have a course we just go through the motions but
	// the recipient list will be empty.
	let course: CourseModel | undefined;
	if (event.courseId) {
		course = Courses.findOne(event.courseId);
	}

	const body = {} as Body;
	body.new = isNew;
	body.eventId = event._id;
	body.additionalMessage = additionalMessage;

	// The list of recipients is built right away so that only course members
	// at the time of event creation will get the notice even if sending is
	// delayed.
	body.recipients = [];
	if (course) {
		body.recipients = course.members.map((m) => m.user);
		body.courseId = course._id;
	}

	body.model = 'Event';

	Log.record('Notification.Send', course ? [course._id] : [], body);
}

export function Model(entry: { body: Body }) {
	const event = Events.findOne(entry.body.eventId);

	let course: CourseModel | undefined;
	if (event?.courseId) {
		course = Courses.findOne(event.courseId);
	}

	let region: RegionModel | undefined;
	if (event?.region) {
		region = Regions.findOne(event.region);
	}

	return {
		accepted(actualRecipient: UserModel) {
			if (actualRecipient.notifications === false) {
				throw new Error('User wishes to not receive automated notifications');
			}

			if (!actualRecipient.hasEmail()) {
				throw new Error('Recipient has no email address registered');
			}
		},

		vars(userLocale: string, _actualRecipient: UserModel, unsubToken: string) {
			if (!event) {
				throw new Error('Event does not exist (0.o)');
			}
			if (!course) {
				throw new Error('Course does not exist (0.o)');
			}
			if (!region) {
				throw new Error('Region does not exist (0.o)');
			}

			// Show dates in local time and in users locale
			const regionZone = LocalTime.zone(event.region);

			const startMoment = regionZone.at(event.start);
			startMoment.locale(userLocale);

			const endMoment = regionZone.at(event.end);
			endMoment.locale(userLocale);

			const subjectvars = {
				TITLE: event.title.substr(0, 30),
				DATE: startMoment.format('LL'),
				lng: userLocale,
			};

			let subject;
			if (entry.body.new) {
				subject = i18n('notification.event.mail.subject.new', 'On {DATE}: {TITLE}', subjectvars);
			} else {
				subject = i18n(
					'notification.event.mail.subject.changed',
					'Fixed {DATE}: {TITLE}',
					subjectvars,
				);
			}

			const { venue } = event;
			let venueLine: string | undefined;
			if (venue) {
				venueLine = [venue.name, venue.address].filter(Boolean).join(', ');
			}

			const siteName = getSiteName(region);
			const emailLogo = region.custom?.emailLogo;

			const courseLink = Router.url('showCourse', course, { query: 'campaign=eventNotify' });
			return {
				unsubLink: Router.url('profileNotificationsUnsubscribe', { token: unsubToken }),
				event,
				eventDate: startMoment.format('LL'),
				eventStart: startMoment.format('LT'),
				eventEnd: endMoment.format('LT'),
				venueLine,
				regionName: region.name,
				timeZone: endMoment.format('z'), // Ignoring the possibility that event start could have a different offset like when going from CET to CEST
				eventLink: Router.url('showEvent', event, { query: 'campaign=eventNotify' }),
				registerToEventLink: Router.url('showEvent', event, {
					query: 'action=register&campaign=eventNotify',
				}),
				course: Spacebars.SafeString(`<a href="${courseLink}">${course.name}</a>`),
				unsubscribeFromCourseLink: Router.url('showCourse', course, {
					query: 'unsubscribe=participant&campaign=eventNotify',
				}),
				calLink: Router.url('calEvent', event, { query: 'campaign=eventNotify' }),
				new: entry.body.new,
				subject,
				additionalMessage: entry.body.additionalMessage,
				customSiteUrl: `${Meteor.absoluteUrl()}?campaign=eventNotify`,
				customSiteName: siteName,
				customEmailLogo: emailLogo,
			};
		},
		template: 'notificationEventEmail',
	};
}
