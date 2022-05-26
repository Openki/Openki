import moment from 'moment';

import { CourseEntity, CourseModel, Courses } from '/imports/api/courses/courses';
import { Events } from '/imports/api/events/events';
import { Groups } from '/imports/api/groups/groups';

export interface Stats {
	total: {
		numCourses: number;
		activeCourses: number;
		passedEvents: number;
		futureEvents: number;
		usersParticipating: number;
	};
	group: {
		groups: {
			id: string | undefined;
			name: string | undefined;
			numCourses: number;
			activeCourses: number;
			passedEvents: number;
			futureEvents: number;
			usersParticipating: number;
		}[];
		total: {
			numCourses: number;
			activeCourses: number;
			passedEvents: number;
			futureEvents: number;
			usersParticipating: number;
		};
	};
}

function getCourses(regionId: string) {
	const filter: Mongo.Selector<CourseEntity> = {};
	if (regionId && regionId !== 'all') {
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
		numCourses: 0,
		activeCourses: 0,
		passedEvents: 0,
		futureEvents: 0,
		usersParticipating: 0,
	};
	stats.group.groups.forEach((stat) => {
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

function getGroupStats(regionId: string, groupId?: string | undefined) {
	let groupFilter: string | RegExp | Mongo.FieldExpression<string> | undefined = groupId;
	if (!groupFilter) {
		groupFilter = { $eq: [] } as any;
	}

	const groupRow = Groups.findOne({ _id: groupId }, { fields: { name: 1 } });

	const name = groupRow?.name;

	const courseFilter: Mongo.Selector<CourseEntity> = {
		groups: groupFilter,
	};

	if (regionId) {
		courseFilter.region = regionId;
	}

	const courses = Courses.find(courseFilter);
	const numCourses = courses.count();
	const activeCourses = getActiveCoursesStats(courses);
	const { passedEvents, futureEvents } = getEventStats(courses);
	const usersParticipating = getUsersParticpating(courses);
	return {
		id: groupId,
		name,
		numCourses,
		activeCourses,
		passedEvents,
		futureEvents,
		usersParticipating,
	};
}

function getStatsTotal(regionId: string) {
	const courseFilter: Mongo.Selector<CourseEntity> = {};

	if (regionId) {
		courseFilter.region = regionId;
	}

	const courses = Courses.find(courseFilter);
	const numCourses = courses.count();
	const activeCourses = getActiveCoursesStats(courses);
	const { passedEvents, futureEvents } = getEventStats(courses);
	const usersParticipating = getUsersParticpating(courses);
	return {
		numCourses,
		activeCourses,
		passedEvents,
		futureEvents,
		usersParticipating,
	};
}

export function getRegionStats(regionFilter: string) {
	const groupIds = getGroupIds(getCourses(regionFilter));
	const stats: Stats = { total: {} as any, group: { groups: [], total: {} as any } };

	groupIds.forEach((groupId) => {
		stats.group.groups.push(getGroupStats(regionFilter, groupId));
	});
	// courses without groups
	stats.group.groups.push(getGroupStats(regionFilter));
	stats.group.groups.sort((a, b) => b.numCourses - a.numCourses);
	stats.group.total = getGroupStatsTotal(stats);
	stats.total = getStatsTotal(regionFilter);
	return stats;
}

export default getRegionStats;
