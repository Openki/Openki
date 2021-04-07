import { mf } from 'meteor/msgfmt:core';
import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';

import Events from '/imports/api/events/events';
import Roles from '/imports/api/roles/roles';

import '/imports/ui/components/profile-link/profile-link';

import './course-history.html';

Template.coursehistory.helpers({
	pastEventsList() {
		/** @type {{dateTime: Date|undefined, template: string, data: object}[]} */
		const historyEntries = [];

		// add past events
		historyEntries.push(...Events.find(
			{ courseId: this.course._id, start: { $lt: new Date() } },
		).map((e) => ({ dateTime: e.start, template: 'eventHeldHistoryEntry', data: e })));

		const course = Template.instance().data.course;

		// merge with all history entries
		historyEntries.push(...course.history?.map(
			(e) => ({
				dateTime: e.dateTime,
				template: `${e.type}HistoryEntry`,
				data: {
					...e.data,
					roleTitle: e.data.role ? mf(`roles.${e.data.role}.short`) : undefined,
					roleIcon: e.data.role ? Roles.filter((r) => r.type === e.data.role)[0]?.icon : undefined,
				},
			}),
		) || []);

		// and with the course creation
		historyEntries.push({ dateTime: course.time_created, template: 'courseCreatedHistoryEntry', data: course });

		// and sort by date time desc
		historyEntries.sort((a, b) => (b.dateTime?.getTime() || 0) - (a.dateTime?.getTime() || 0));

		return historyEntries;
	},
});
