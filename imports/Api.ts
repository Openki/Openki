import { Router } from 'meteor/iron:router';
import moment from 'moment';
import { Users } from '/imports/api/users/users';
import { Courses } from '/imports/api/courses/courses';
import { Events } from '/imports/api/events/events';
import { Groups } from '/imports/api/groups/groups';
import { Venues } from '/imports/api/venues/venues';
import { Geodata, Regions } from '/imports/api/regions/regions';

import { visibleTenants } from '/imports/utils/visible-tenants';
import { Filtering } from '/imports/utils/filtering';
import { ParamWrapper, Predicate } from '/imports/utils/predicates';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type ExtractQuery<P> = P extends ParamWrapper<infer _G, infer Q> ? Q : never;

export interface ApiCollection<T, U, F extends { [name: string]: Predicate<any> }> {
	findFilter(
		filter?: Partial<{ [name in keyof F]: ExtractQuery<F[name]> }>,
		limit?: number,
		skip?: number,
		sort?: [string, 'asc' | 'desc'][],
	): Mongo.Cursor<T, U>;
	Filtering(): Filtering<F>;
}

function apiResponse<T, U, F extends { [name: string]: Predicate<any> }, R>(
	collection: ApiCollection<T, U, F>,
	formatter: (model: U) => R,
) {
	return (filter = {}, limit = 0, skip = 0, sort?: [string, 'asc' | 'desc'][]) => {
		const query = collection.Filtering().readAndValidate(filter).done().toQuery();
		return collection
			.findFilter({ ...query, tenants: visibleTenants() }, limit, skip, sort)
			.map(formatter);
	};
}

function maybeUrl(route: string, context: { _id?: string } | undefined) {
	if (!context || !context._id) {
		return undefined;
	}
	return Router.url(route, context);
}

const Api = {
	groups: apiResponse(Groups, (originalGroup) => {
		const group = { ...originalGroup } as typeof originalGroup & { link: string };
		group.link = Router.url('groupDetails', group);
		return group;
	}),
	venues: apiResponse(Venues, (originalVenue) => {
		const venue = { ...originalVenue } as typeof originalVenue & { link: string };
		venue.link = Router.url('venueDetails', venue);
		return venue;
	}),
	events: apiResponse(Events, (ev) => {
		const evr = {
			id: ev._id,
			title: ev.title,
			description: ev.description,
			startLocal: ev.startLocal,
			endLocal: ev.endLocal,
			start: ev.start,
			end: ev.end,
			duration: moment(ev.end).diff(ev.start) / 60000, // Minutes
			link: Router.url('showEvent', ev),
			internal: ev.internal,
			room: ev.room,
		} as {
			id: string;
			title: string;
			description: string;
			startLocal: string;
			endLocal: string;
			start: Date;
			end: Date;
			duration: number;
			link: string;
			internal: boolean;
			room: string;
			createdBy?: { id: string; name: string };
			venue?: {
				id: string | undefined;
				name: string | undefined;
				loc: Geodata | undefined;
				link: string | undefined;
			};
			course?: {
				id: string;
				name: string;
				link: string;
			};
			groups: {
				id: string;
				name: string;
				short: string;
				link: string;
			}[];
		};

		const creator = Users.findOne(ev.createdBy);
		if (creator) {
			evr.createdBy = {
				id: creator._id,
				name: creator.username,
			};
		}

		if (ev.venue) {
			evr.venue = {
				id: ev.venue._id,
				name: ev.venue.name,
				loc: ev.venue.loc,
				link: maybeUrl('venueDetails', ev.venue),
			};
		}

		if (ev.courseId) {
			const course = Courses.findOne(ev.courseId);
			if (course) {
				evr.course = {
					id: ev.courseId,
					name: course.name,
					link: Router.url('showCourse', course),
				};
			}
		}

		evr.groups = [];
		const groups = ev.allGroups || [];
		groups.forEach((groupId) => {
			const group = Groups.findOne(groupId);
			if (group) {
				evr.groups.push({
					id: group._id,
					name: group.name,
					short: group.short,
					link: Router.url('groupDetails', group),
				});
			}
		});

		return evr;
	}),
	courses: apiResponse(Courses, (orginalCourse) => {
		const course = {
			id: orginalCourse._id,
			name: orginalCourse.name,
			description: orginalCourse.description,
			link: Router.url('showCourse', orginalCourse),
			internal: orginalCourse.internal,
			interested: orginalCourse.interested,
		} as {
			id: string;
			name: string;
			description: string;
			link: string;
			internal: boolean;
			interested: number;
			region?: {
				id: string;
				name: string;
			};
			createdBy?: {
				id: string;
				name: string;
			};
			groups: {
				id: string;
				name: string;
				short: string;
				link: string;
			}[];
		};

		const region = Regions.findOne(orginalCourse.region);
		if (region) {
			course.region = {
				id: region._id,
				name: region.name,
			};
		}

		const creator = Users.findOne(orginalCourse.createdby);
		if (creator) {
			course.createdBy = {
				id: creator._id,
				name: creator.username,
			};
		}

		course.groups = [];
		const groups = orginalCourse.groups || [];
		groups.forEach((groupId) => {
			const group = Groups.findOne(groupId);
			if (group) {
				course.groups.push({
					id: group._id,
					name: group.name,
					short: group.short,
					link: Router.url('groupDetails', group),
				});
			}
		});

		return course;
	}),
};

export default Api;
