import moment from 'moment';

import { CourseEntity, CourseModel, Courses } from '/imports/api/courses/courses';
import { Events } from '/imports/api/events/events';
import { Groups } from '/imports/api/groups/groups';

interface Stats {
	detail: {
		group: string | undefined;
		groupName: string;
		numCourses: number;
		activeCourses: number;
		passedEvents: number;
		futureEvents: number;
		usersParticipating: number;
	}[];
	total: {
		group: string;
		numCourses: number;
		activeCourses: number;
		passedEvents: number;
		futureEvents: number;
		usersParticipating: number;
	};
}

function getCourses(regionId: string) {
	const filter: Mongo.Selector<CourseEntity> = {};
	if (regionId && regionId !== 'all_regions') {
		filter.region = regionId;
	}
	return Courses.find(filter);
}

function getGroupIds(courses: Mongo.Cursor<CourseEntity, CourseModel>) {
	const groupIds: string[] = [];
	courses.forEach((course) => {
		course.groups.forEach((group) => {
			if (!groupIds.includes(group)) groupIds.push(group);
		});
	});
	return groupIds;
}

function getGroupStatsTotal(stats: Stats) {
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
}

function getEventStats(courses: Mongo.Cursor<CourseEntity, CourseModel>) {
	const now = new Date();
	let passedEvents = 0;
	let futureEvents = 0;
	courses.forEach((course) => {
		passedEvents += Events.find({ courseId: course._id, end: { $lt: now } }).count();
		futureEvents += Events.find({ courseId: course._id, end: { $gte: now } }).count();
	});
	return { passedEvents, futureEvents };
}

function getUsersParticpating(courses: Mongo.Cursor<CourseEntity, CourseModel>) {
	let usersParticipating = 0;
	courses.forEach((course) => {
		usersParticipating += course.members.length;
	});
	return usersParticipating;
}

function getActiveCoursesStats(courses: Mongo.Cursor<CourseEntity, CourseModel>) {
	let activeCourses = 0;
	courses.forEach((course) => {
		const query = {
			courseId: course._id,
			$and: [
				{ start: { $gte: moment().subtract(2, 'weeks').toDate() } },
				{ start: { $lt: moment().add(6, 'months').toDate() } },
			],
		};
		const activeEvent = Events.findOne(query, { fields: { groups: 1 } });
		if (activeEvent) {
			activeCourses += 1;
		}
	});
	return activeCourses;
}

function getGroupStats(region: string, group?: string | undefined) {
	let groupFilter: string | RegExp | Mongo.FieldExpression<string> | undefined = group;
	if (!groupFilter) {
		groupFilter = { $eq: '' };
	}

	const groupRow = Groups.findOne({ _id: group }, { fields: { name: 1, _id: 0 } });

	const groupName = groupRow?.name || 'ungrouped';

	const courseFilter: Mongo.Selector<CourseEntity> = {
		groups: groupFilter,
	};

	if (region) {
		courseFilter.region = region;
	}

	const courses = Courses.find(courseFilter);
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
}

const Stats = {
	getRegionStats(regionFilter: string) {
		const groupIds = getGroupIds(getCourses(regionFilter));
		const stats: Stats = { detail: [], total: [] as any };

		groupIds.forEach((groupId) => {
			stats.detail.push(getGroupStats(regionFilter, groupId));
		});
		// courses without groups
		stats.detail.push(getGroupStats(regionFilter));
		stats.detail.sort((a, b) => b.numCourses - a.numCourses);
		stats.total = getGroupStatsTotal(stats);
		return stats;
	},
};

export default Stats;
