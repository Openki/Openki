
import update20201216MergeUserLocale from '../updates/2020.12.16 mergeUserLocale';

const UpdatesAvailable = { '2020.12.16 mergeUserLocale': update20201216MergeUserLocale };


const UpdatesApplied = new Meteor.Collection('UpdatesApplied');

const applyUpdates = function () {
	const skipInitial = UpdatesApplied.find().count() === 0;

	Object.keys(UpdatesAvailable).forEach((name) => {
		if (UpdatesApplied.find({ name }).count() === 0) {
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
};

export default applyUpdates;
