import { Mongo } from 'meteor/mongo';

import update20201216MergeUserLocale from '../updates/2020.12.16 mergeUserLocale';
import update20210106EnsureVenueSlugField from '../updates/2021.01.06 ensureVenueSlugField';
import update20210112EnsureCourseInterestedField from '../updates/2021.01.12 ensureCourseInterestedField';
import update20210128PrivateMessagesForAll from '../updates/2021.01.28 privateMessagesForAll';
import update20210211AvatarColor from '../updates/2021.02.11 avatarColor';
import update20210218UserDescription from '../updates/2021.02.18 userDescription';
import { update as update20210309HistorySubscribeUnsubscribe } from '../updates/2021.03.09 historySubscribeUnsubscribe';
import { update as update20210421EnsureCourseArchivedField } from '../updates/2021.04.21 ensureCourseArchivedField';

/** @type {{[name: string]: () => number }} */
const UpdatesAvailable = {
	'2020.12.16 mergeUserLocale': update20201216MergeUserLocale,
	'2021.01.06 ensureVenueSlugField': update20210106EnsureVenueSlugField,
	'2021.01.12 ensureCourseInterestedField': update20210112EnsureCourseInterestedField,
	'2021.01.28 privateMessagesForAll': update20210128PrivateMessagesForAll,
	'2021.02.11 avatarColor': update20210211AvatarColor,
	'2021.02.18 userDescription': update20210218UserDescription,
	'2021.03.09 historySubscribeUnsubscribe': update20210309HistorySubscribeUnsubscribe,
	'2021.04.21 ensureCourseArchivedField': update20210421EnsureCourseArchivedField,
};

const UpdatesApplied = new Mongo.Collection('UpdatesApplied');

export function applyUpdates() {
	const skipInitial = UpdatesApplied.find().count() === 0;

	Object.keys(UpdatesAvailable).forEach((name) => {
		if (UpdatesApplied.find({ name }).count() === 0) {
			/** @type {{name: string; affected: number; run: Date, applied?: Date}} */
			const entry = {
				name,
				affected: 0,
				run: new Date(),
			};

			if (skipInitial) {
				/* eslint-disable-next-line no-console */
				console.log(`Skipping update ${name}`);
			} else {
				/* eslint-disable-next-line no-console */
				console.log(`Applying update ${name}`);
				entry.affected = UpdatesAvailable[name]();
				entry.applied = new Date();
				/* eslint-disable-next-line no-console */
				console.log(`${name}: ${entry.affected} affected documents`);
			}
			UpdatesApplied.insert(entry);
		}
	});
}

export default applyUpdates;
