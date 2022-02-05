import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import { Events } from '/imports/api/events/events';
import { CourseModel } from '/imports/api/courses/courses';

import '/imports/ui/components/profile-link';

import './template.html';
import './styles.scss';

const Template = TemplateAny as TemplateStaticTyped<'coursehistory', { course: CourseModel }>;

const template = Template.coursehistory;

template.helpers({
	pastEventsList() {
		const historyEntries: { dateTime: Date | undefined; template: string; data: object }[] = [];

		// add past events
		historyEntries.push(
			...Events.find({
				courseId: Template.currentData().course._id,
				start: { $lt: new Date() },
			}).map((e) => ({
				dateTime: e.start,
				template: 'eventHeldHistoryEntry',
				data: e,
			})),
		);

		const course = Template.instance().data.course;

		// merge with all history entries
		historyEntries.push(
			...(course.history?.map((e) => ({
				dateTime: e.dateTime,
				template: `${e.type}HistoryEntry`,
				data: e.data,
			})) || []),
		);

		// and with the course creation
		historyEntries.push({
			dateTime: course.time_created,
			template: 'createdHistoryEntry',
			data: course,
		});

		// and sort by date time desc
		historyEntries.sort((a, b) => (b.dateTime?.getTime() || 0) - (a.dateTime?.getTime() || 0));

		return historyEntries;
	},
});
