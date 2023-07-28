import { Meteor } from 'meteor/meteor';
import { Version } from '/imports/api/version/version';
import { _ } from 'meteor/underscore';

import { runBackgroundTasks } from "/imports/utils/background-tasks";

runBackgroundTasks && Meteor.startup(() => {
	const runningVersion = Version.findOne();
	if (
		typeof VERSION !== 'undefined' &&
		(!runningVersion ||
			runningVersion.complete !== VERSION.complete ||
			runningVersion.commit !== VERSION.commit)
	) {
		const newVersion = _.extend(VERSION, {
			activation: new Date(),
		});
		Version.upsert({}, newVersion);
	}
	Version.update({}, { $set: { lastStart: new Date() } });
});
