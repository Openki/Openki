import { check } from 'meteor/check';
import { Router } from 'meteor/iron:router';
import { Meteor } from 'meteor/meteor';
import { Spacebars } from 'meteor/spacebars';

import { Log } from '/imports/api/log/log';
import { UserModel, Users } from '/imports/api/users/users';
import { Regions } from '/imports/api/regions/regions';
import { Events } from '/imports/api/events/events';

import { i18n } from '/imports/startup/both/i18next';
import * as StringTools from '/imports/utils/string-tools';
import { getSiteName } from '/imports/utils/getSiteName';
import { LocalTime } from '/imports/utils/local-time';

interface Body {
	sender: string;
	event: string;
	recipients: string[];
	model: string;
}

/**
 * Record the intent to send a private message
 * @param senderId id of the user that canceled the event
 * @param eventId id of the event that are canceld
 */
export function record(senderId: string, eventId: string) {
	check(senderId, String);
	check(eventId, String);

	const recipients = [];

	const event = Events.findOne(eventId);
	if (!event) {
		throw new Meteor.Error(`No event for ${eventId}`);
	}

	const participants = event.participants?.map((p) => p.user);

	if (!participants?.length) {
		throw new Meteor.Error(`Event ${eventId} has none participants.`);
	}

	recipients.push(...participants.filter((p) => p !== senderId));

	const body: Body = {
		event: eventId,
		sender: senderId,
		recipients,
		model: 'Event.Canceled',
	};

	Log.record('Notification.Send', [senderId, eventId, ...recipients], body);
}

export function Model(entry: { body: Body }) {
	const { body } = entry;
	const sender = Users.findOne(body.sender);
	const event = Events.findOne(body.event);

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
			if (!sender) {
				throw new Error('Sender does not exist (0.o)');
			}
			if (!event) {
				throw new Error('Event does not exist (0.o)');
			}

			const subjectvars = {
				EVENT: StringTools.truncate(event.title, 50),
				SENDER: StringTools.truncate(sender.getDisplayName(), 10),
				lng: userLocale,
			};
			const subject = i18n(
				'notification.event.canceled.mail.subject',
				'{EVENT} canceled',
				subjectvars,
			);

			const region = Regions.findOne(event.region);

			const emailLogo = region?.custom?.emailLogo;
			const siteName = getSiteName(region);

			const senderUrl = Router.url('userprofile', sender, {
				query: 'campaign=eventCanceled',
			});

			const vars = {
				unsubLink: Router.url('profileNotificationsUnsubscribe', { token: unsubToken }),
				sender,
				senderLink: senderUrl,
				senderName: Spacebars.SafeString(`<a href="${senderUrl}">${sender.getDisplayName()}</a>`),
				subject,
				customSiteUrl: `${Meteor.absoluteUrl()}?campaign=eventCanceled`,
				customSiteName: siteName,
				customEmailLogo: emailLogo,
				eventTitle: '',
			};

			// Show dates in local time and in users locale
			const regionZone = LocalTime.zone(event.region);
			const startMoment = regionZone.at(event.start);
			startMoment.locale(userLocale);

			const eventFullTitle = i18n('notification.event.canceled.mail.title', '{DATE} — {EVENT}', {
				EVENT: event.title,
				DATE: startMoment.calendar(),
			});
			const eventUrl = Router.url('showEvent', event, {
				query: 'campaign=eventCanceled',
			});

			vars.eventTitle = Spacebars.SafeString(`<a href="${eventUrl}">${eventFullTitle}</a>`);

			return vars;
		},
		template: 'notificationEventCanceledEmail',
	};
}
