import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';

import { Events, FindFilter } from '/imports/api/events/events';

import { AffectedReplicaSelectors } from '/imports/utils/affected-replica-selectors';
import { visibleTenants } from '/imports/utils/visible-tenants';
import { ServerPublish } from '/imports/utils/ServerPublish';

export const all = ServerPublish('events', (region?: string) => {
	check(region, Match.Optional(String));

	if (!region) {
		return Events.find({ tenant: { $in: visibleTenants() } });
	}
	return Events.find({ region, tenant: { $in: visibleTenants() } });
});

export const details = ServerPublish('event', (eventId: string) => {
	check(eventId, String);

	return Events.find({ _id: eventId, tenant: { $in: visibleTenants() } });
});

export const findFilter = ServerPublish(
	'Events.findFilter',
	(filter: FindFilter = {}, limit = 0, skip = 0, sort?: [string, 'asc' | 'desc'][]) => {
		return Events.findFilter({ ...filter, tenants: visibleTenants() }, limit, skip, sort);
	},
);

export const forCourse = ServerPublish('eventsForCourse', (courseId: string) => {
	check(courseId, String);

	return Events.find({ courseId, tenant: { $in: visibleTenants() } });
});

export const affectedReplica = ServerPublish('affectedReplica', (eventId: string) => {
	check(eventId, String);

	const event = Events.findOne({
		_id: eventId,
		tenant: {
			$in: visibleTenants(),
		},
	});
	if (!event) {
		throw new Meteor.Error(400, `provided event id ${eventId} is invalid`);
	}
	return Events.find(AffectedReplicaSelectors(event));
});
