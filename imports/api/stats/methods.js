import { Meteor } from 'meteor/meteor';

import Courses from '/imports/api/courses/courses';
import Events from '/imports/api/events/events';
import Groups from '/imports/api/groups/groups';


const getCourses = (regionId) => {
	const filter = {};
	if (regionId && regionId !== 'all_regions') {
		filter.region = regionId;
	}
	return Courses.find(filter);
};

const getGroupIds = (courses) => {
	const groupIds = [];
	courses.forEach((course) => {
		course.groups.forEach((group) => {
			if (!groupIds.includes(group)) groupIds.push(group);
		});
	});
	return groupIds;
};

const getGroupStatsTotal = (stats) => {
	const totalStats = {
		group: 'total',
		numCourses: 0,
		activeCourses: 0,
		passedEvents: 0,
		futureEvents: 0,
		usersParticipating: 0,
	};
	stats.detail.forEach((stat) => {
		totalStats.numCourses += stat.numCourses;
		totalStats.activeCourses += stat.activeCourses;
		totalStats.passedEvents += stat.passedEvents;
		totalStats.futureEvents += stat.futureEvents;
		totalStats.usersParticipating += stat.usersParticipating;
	});
	return totalStats;
};

const getEventStats = (courses) => {
	const now = new Date();
	let passedEvents = 0;
	let futureEvents = 0;
	courses.forEach((course) => {
		passedEvents += Events.find({ courseId: course._id, end: { $lt: now } }).count();
		futureEvents += Events.find({ courseId: course._id, end: { $gte: now } }).count();
	});
	return { passedEvents, futureEvents };
};

const getUsersParticpating = (courses) => {
	let usersParticipating = 0;
	courses.forEach((course) => {
		usersParticipating += course.members.length;
	});
	return usersParticipating;
};

const getActiveCoursesStats = (courses) => {
	let activeCourses = 0;
	courses.forEach(() => {
		const events = Events.find({
			$and: [
				{ start: { $gte: moment().subtract(2, 'weeks').toDate() } },
				{ start: { $lt: moment().add(6, 'months').toDate() } },
			],
		}, { fields: { groups: 1 } });
		if (events.count()) activeCourses += 1;
	});
	return activeCourses;
};

const getGroupStats = (region, group) => {
	let groupFilter = group;
	if (!groupFilter) {
		groupFilter = { $eq: [] };
	}

	const groupRow = Groups.findOne({ _id: group }, { fields: { name: 1, _id: 0 } });


	const groupName = groupRow ? groupRow.name : 'ungrouped';


	const courses = Courses.find({ region, groups: groupFilter });
	const numCourses = courses.count();
	const activeCourses = getActiveCoursesStats(courses);
	const { passedEvents, futureEvents } = getEventStats(courses);
	const usersParticipating = getUsersParticpating(courses);
	return {
		group,
		groupName,
		numCourses,
		activeCourses,
		passedEvents,
		futureEvents,
		usersParticipating,
	};
};

const getRegionStats = (regionFilter) => {
	const groupIds = getGroupIds(
		getCourses(regionFilter),
	);
	const stats = { detail: [] };

	groupIds.forEach((groupId) => {
		stats.detail.push(
			getGroupStats(regionFilter, groupId),
		);
	});
	// courses without groups
	stats.detail.push(
		getGroupStats(regionFilter),
	);
	stats.detail.sort((a, b) => b.numCourses - a.numCourses);
	stats.total = getGroupStatsTotal(stats);
	return stats;
};

Meteor.methods({
	'stats.region'(regionId) {
		const regionFilter = regionId === 'all_regions' ? '' : regionId;
		return getRegionStats(regionFilter);
	},
});
