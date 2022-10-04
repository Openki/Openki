import { Router } from 'meteor/iron:router';
import { Meteor } from 'meteor/meteor';

import { Session } from 'meteor/session';
import { _ } from 'meteor/underscore';
import moment from 'moment';
import momentTz from 'moment-timezone';

import { CourseMemberEntity, CourseModel, Courses } from '/imports/api/courses/courses';
import {
	EventEntity,
	EventModel,
	Events,
	FindFilter as EventsFindFilter,
	OEvent,
} from '/imports/api/events/events';
import { Group, GroupEntity, GroupModel } from '/imports/api/groups/groups';
import * as Groups from '/imports/api/groups/publications';
import { Region, RegionModel } from '/imports/api/regions/regions';
import * as Regions from '/imports/api/regions/publications';
import * as InfoPages from '/imports/api/infoPages/publications';
import { Tenant, TenantEntity, TenantModel, Tenants } from '/imports/api/tenants/tenants';
import { Roles } from '/imports/api/roles/roles';
import { Venue, VenueEntity, VenueModel } from '/imports/api/venues/venues';
import * as Venues from '/imports/api/venues/publications';
import { UserModel, Users } from '/imports/api/users/users';
import { Invitations } from '/imports/api/invitations/invitations';
import type { Data as GroupDetailsData } from '/imports/ui/pages/group-details';

import * as Analytics from '/imports/ui/lib/analytics';
import CleanedRegion from '/imports/ui/lib/cleaned-region';
import CourseTemplate from '/imports/ui/lib/course-template';
import { CssFromQuery } from '/imports/ui/lib/css-from-query';

import { Filtering } from '/imports/utils/filtering';
import LocalTime from '/imports/utils/local-time';
import { reactiveNow } from '/imports/utils/reactive-now';
import * as Predicates from '/imports/utils/predicates';
import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';
import * as RouterAsync from '/imports/utils/RouterAsync';

const makeFilterQuery = function (params: Record<string, string | undefined>) {
	const filter = Events.Filtering().read(params).done();

	const query = filter.toQuery() as EventsFindFilter;

	let start: moment.Moment | undefined;
	if (params.start) {
		start = moment(params.start);
	}
	if (!start || !start.isValid()) {
		start = moment(reactiveNow.get()).startOf('day');
	}

	let end: moment.Moment | undefined;
	if (params.end) {
		end = moment(params.end);
	}
	if (!end || !end.isValid()) {
		end = moment(start).add(1, 'day');
	}

	query.period = [start.toDate(), end.toDate()];

	return query;
};

function loadRoles(course: CourseModel, member?: CourseMemberEntity) {
	return Roles.filter((r) => course.roles?.includes(r.type)).map((r) => ({
		role: r,
		subscribed: course.userHasRole(Meteor.userId(), r.type),
		comment: member?.comment,
		course,
	}));
}

if (Meteor.isClient) {
	Analytics.installRouterActions(Router);
}

RouterAsync.route('adminPanel', {
	path: 'admin',
	template: 'adminPanelPage',
	async onRun() {
		await import('/imports/ui/pages/admin/panel');
	},
});

RouterAsync.route('calendar', {
	path: 'calendar',
	template: 'calendarPage',
	async onRun() {
		await import('/imports/ui/pages/calendar');
	},
	data() {
		return this.params.query;
	},
});

RouterAsync.route('featureGroup', {
	path: 'admin/feature-group',
	template: 'adminFeatureGroupPage',
	async onRun() {
		await import('/imports/ui/pages/admin/feature-group');
	},
});

RouterAsync.route('tenants', {
	path: 'admin/tenants',
	template: 'adminTenantsPage',
	async onRun() {
		await import('/imports/ui/pages/admin/tenants');
	},
	waitOn() {
		return Meteor.subscribe('Tenants.findFilter');
	},
});

RouterAsync.route('home', {
	path: '/',
	template: 'findPage',
	yieldRegions: {
		featuredGroup: { to: 'aboveContent' },
	},
	async onRun() {
		await import('/imports/ui/pages/find');
	},
	data() {
		const { query } = this.params;

		// Add filter options for the homepage
		return _.extend(query, {
			internal: false,
			region: Session.get('region'),
		});
	},
});

RouterAsync.route('users', {
	path: 'admin/users',
	template: 'adminUsersPage',
	async onRun() {
		await import('/imports/ui/pages/admin/users');
	},
});

RouterAsync.route('frameCalendar', {
	path: '/frame/calendar',
	template: 'frameCalendarPage',
	layoutTemplate: 'frameLayout',
	async onRun() {
		await import('/imports/ui/pages/frames/calendar');
	},
	data() {
		const cssRules = new CssFromQuery(this.params.query, [
			['itembg', 'background-color', '.frame-list-item'],
			['itemcolor', 'color', '.frame-list-item'],
			['linkcolor', 'color', '.frame-list-item a'],
			['regionbg', 'background-color', '.frame-list-item-region'],
			['regioncolor', 'color', '.frame-list-item-region'],
		]).getCssRules();
		return { cssRules };
	},
});

RouterAsync.route('frameCourselist', {
	path: '/frame/courselist',
	template: 'frameCourselistPage',
	layoutTemplate: 'frameLayout',
	async onRun() {
		await import('/imports/ui/pages/frames/courselist');
	},
	data() {
		const cssRules = new CssFromQuery(this.params.query, [
			['itembg', 'background-color', '.frame-list-item'],
			['itemcolor', 'color', '.frame-list-item'],
			['linkcolor', 'color', '.frame-list-item a'],
			['regionbg', 'background-color', '.frame-list-item-region'],
			['regioncolor', 'color', '.frame-list-item-region'],
		]).getCssRules();
		const hideInterested = Number.parseInt(this.params.query.hideInterested || '', 10) || 0;
		return { cssRules, hideInterested };
	},
});

RouterAsync.route('frameEvents', {
	path: '/frame/events',
	template: 'frameEventsPage',
	layoutTemplate: 'frameLayout',
	async onRun() {
		await import('/imports/ui/pages/frames/events');
	},
	data() {
		return this.params.query;
	},
});

RouterAsync.route('framePropose', {
	path: '/frame/propose',
	template: 'frameProposePage',
	layoutTemplate: 'frameLayout',
	async onRun() {
		await import('/imports/ui/pages/frames/propose');
	},
	waitOn: () => Meteor.subscribe('Regions'),
	data() {
		const predicates = {
			region: Predicates.id,
			addTeamGroups: Predicates.ids,
			neededRoles: Predicates.ids,
			setCreatorsRoles: Predicates.ids,
			internal: Predicates.flag,
			hidePricePolicy: Predicates.flag,
			hideCategories: Predicates.flag,
		};
		const query = new Filtering(predicates).read(this.params.query).done().toQuery() as any;

		if (query.addTeamGroups) {
			// For security reasons only 5 groups are allowed
			query.teamGroups = query.addTeamGroups.slice(0, 5);
		}
		delete query.addTeamGroups;

		if (!query.neededRoles) {
			query.neededRoles = ['mentor'];
		}
		if (query.setCreatorsRoles) {
			query.hideRoleSelection = true;
		} else {
			query.setCreatorsRoles = [];
		}
		query.roles = ['mentor', 'host'].filter(
			(role) => query.neededRoles.includes(role) || query.setCreatorsRoles.includes(role),
		);
		delete query.neededRoles;

		query.creatorsRoles = ['mentor', 'host'].filter((role) =>
			query.setCreatorsRoles.includes(role),
		);
		delete query.setCreatorsRoles;

		query.isFrame = true;

		return query;
	},
});

RouterAsync.route('frameSchedule', {
	path: '/frame/schedule',
	template: 'frameSchedulePage',
	layoutTemplate: 'frameLayout',
	async onRun() {
		await import('/imports/ui/pages/frames/schedule');
	},
});

RouterAsync.route('frameWeek', {
	path: '/frame/week',
	template: 'frameWeekPage',
	layoutTemplate: 'frameLayout',
	async onRun() {
		await import('/imports/ui/pages/frames/week');
	},
	data() {
		return this.params.query;
	},
});

RouterAsync.route('groupDetails', {
	path: 'group/:_id/:short?',
	template: 'groupDetailsPage',
	async onRun() {
		await import('/imports/ui/pages/group-details');
	},
	subscriptions() {
		return { details: Groups.details.subscribe(this.params._id as string) };
	},
	data(): GroupDetailsData | undefined {
		let group: GroupModel | undefined;
		const isNew = this.params._id === 'create';
		if (isNew) {
			group = new Group() as GroupModel;
		} else {
			group = this.subscriptions().details();
		}

		if (!group) {
			return undefined;
		}

		const courseQuery = Object.assign(this.params.query, {
			group: group._id,
			region: Session.get('region'),
		});

		return {
			courseQuery,
			group,
			showCourses: !isNew,
		};
	},
});

RouterAsync.route('kioskEvents', {
	path: '/kiosk/events',
	template: 'kioskEventsPage',
	layoutTemplate: 'kioskLayout',
	async onRun() {
		await import('/imports/ui/pages/kiosk/events');
	},
	waitOn() {
		const now = reactiveNow.get(); // Time dependency so this will be reactively updated

		const filter = Events.Filtering().read(this.params.query).done();
		Session.set('kioskFilter', filter.toParams());

		const queryFuture = filter.toQuery() as EventsFindFilter;
		queryFuture.after = now;

		const queryOngoing = filter.toQuery() as EventsFindFilter;
		queryOngoing.ongoing = now;

		return [
			Meteor.subscribe('Events.findFilter', queryFuture, 20),
			Meteor.subscribe('Events.findFilter', queryOngoing),
		];
	},
	data() {
		const now = reactiveNow.get();
		const tomorrow = new Date(now);
		tomorrow.setHours(tomorrow.getHours() + 24);
		tomorrow.setHours(0);

		const filter = Events.Filtering().read(this.params.query).done();

		const queryFuture = filter.toQuery() as EventsFindFilter;
		queryFuture.after = tomorrow;

		const queryToday = filter.toQuery() as EventsFindFilter;
		queryToday.after = now;
		queryToday.before = tomorrow;

		const queryNow = filter.toQuery() as EventsFindFilter;
		queryNow.ongoing = now;

		const filterParams = filter.toQuery();
		return {
			today: Events.findFilter(queryToday, 20),
			future: Events.findFilter(queryFuture, 10),
			ongoing: Events.findFilter(queryNow),
			filter: filterParams,
		};
	},
	onAfterAction() {
		(this as any).timer = Meteor.setInterval(() => {
			Session.set('seconds', new Date());
		}, 1000);
	},
	onStop() {
		Meteor.clearInterval((this as any).timer);
	},
});

RouterAsync.route('log', {
	path: '/log',
	template: 'logPage',
	async onRun() {
		await import('/imports/ui/pages/log');
	},
	data() {
		return this.params.query;
	},
});

RouterAsync.route('info', {
	path: 'info/:page_slug',
	template: 'infoPage',
	async onRun() {
		await import('/imports/ui/pages/info');
	},
	subscriptions() {
		return {
			infoPage: InfoPages.details.subscribe(this.params.page_slug as string, Session.get('locale')),
		};
	},
	data() {
		const page = this.subscriptions().infoPage();
		if (!page) {
			return undefined;
		}

		return { page };
	},
});

RouterAsync.route('profile', {
	path: 'profile',
	template: 'profilePage',
	async onRun() {
		await import('/imports/ui/pages/profile');
	},
	waitOn() {
		const userId = Meteor.userId();

		if (!userId) {
			return [];
		}

		(this as any).venues = Venues.findFilter.subscribe({ editor: userId });
		(this as any).groups = Groups.findFilter.subscribe({ own: true });
		return [
			Meteor.subscribe('Tenants.findFilter', { adminOf: true }),
			() => (this as any).groups.ready(),
			() => (this as any).venues.ready(),
		];
	},
	data() {
		const data: {
			user?: {
				_id: string;
				name: string;
				notifications: boolean;
				allowPrivateMessages: boolean;
				tenants: Mongo.Cursor<TenantEntity, TenantModel> | never[];
				groups: Mongo.Cursor<GroupEntity, GroupModel>;
				venues: Mongo.Cursor<VenueEntity, VenueModel>;
				email: string;
				verified: boolean;
			};
		} = {};
		const user: UserModel | null = Meteor.user();
		if (user) {
			const userdata = {
				_id: user._id,
				name: user.username,
				notifications: user.notifications,
				allowPrivateMessages: user.allowPrivateMessages,
				tenants: Tenants.findFilter({ adminOf: true }),
				groups: (this as any).groups(),
				venues: (this as any).venues(),
				email: user.emails?.[0]?.address,
				verified: user.emails?.[0]?.verified || false,
			};
			data.user = userdata;
		}
		return data;
	},
});

RouterAsync.route('proposeCourse', {
	path: 'courses/propose',
	template: 'courseProposePage',
	async onRun() {
		await import('/imports/ui/pages/course-create');
	},
	data: CourseTemplate,
});

RouterAsync.route('resetPassword', {
	path: 'reset-password/:token',
	template: 'resetPasswordPage',
	async onRun() {
		await import('/imports/ui/pages/reset-password');
	},
	data() {
		return { token: this.params.token };
	},
});

RouterAsync.route('showCourse', {
	path: 'course/:_id/:slug?',
	template: 'courseDetailsPage',
	async onRun() {
		await import('/imports/ui/pages/course-details');
	},
	waitOn() {
		return Meteor.subscribe('courseDetails', this.params._id);
	},
	data() {
		const course = Courses.findOne({ _id: this.params._id as string });

		if (!course) {
			return undefined;
		}

		const userId = Meteor.userId();
		const member = course.members?.find((memberCandidate) => memberCandidate.user === userId);
		const data = {
			edit: !!this.params.query.edit,
			rolesDetails: loadRoles(course, member),
			course,
			member,
			select: this.params.query.select,
		};
		return data;
	},
});

RouterAsync.route('showEvent', {
	path: 'event/:_id/:slug?',
	template: 'eventPage',
	notFoundTemplate: 'eventNotFound',
	async onRun() {
		await import('/imports/ui/pages/event-details');
	},
	waitOn() {
		const subs = [Meteor.subscribe('event', this.params._id)];
		const { courseId } = this.params.query;
		if (courseId) {
			subs.push(Meteor.subscribe('courseDetails', courseId));
		}
		return subs;
	},
	data() {
		let event: (EventModel & { new?: boolean; startLocal?: string; endLocal?: string }) | undefined;
		const create = this.params._id === 'create';
		if (create) {
			const propose = LocalTime.now().startOf('hour');
			event = _.extend(new OEvent(), {
				new: true,
				startLocal: LocalTime.toString(propose),
				endLocal: LocalTime.toString(moment(propose).add(2, 'hour')),
			}) as EventModel & { new?: boolean; startLocal?: string; endLocal?: string };
			const course = Courses.findOne(this.params.query.courseId);
			if (course) {
				event.title = course.name;
				event.courseId = course._id;
				event.region = course.region;
				event.description = course.description;
				event.internal = course.internal;
			}
		} else {
			event = Events.findOne({ _id: this.params._id as string });
			if (!event) {
				return undefined;
			}
		}

		return event;
	},
});

RouterAsync.route('stats', {
	path: 'stats',
	template: 'statsPage',
	async onRun() {
		await import('/imports/ui/pages/stats');
	},
});

RouterAsync.route('tenantCreate', {
	path: 'tenant/create',
	template: 'tenantCreatePage',
	async onRun() {
		await import('/imports/ui/pages/tenant-create');
	},
	data() {
		const tenant = new Tenant() as TenantModel;
		const region = new Region() as RegionModel;
		region.tz = momentTz.tz.guess();
		return {
			tenant,
			region,
		};
	},
});

RouterAsync.route('tenantDetails', {
	path: 'tenant/:_id/:short?',
	template: 'tenantDetailsPage',
	async onRun() {
		await import('/imports/ui/pages/tenant-details');
	},
	waitOn() {
		return [Meteor.subscribe('tenant', this.params._id)];
	},
	data() {
		const tenant = Tenants.findOne({ _id: this.params._id as string });

		if (!tenant) {
			return undefined;
		}

		return { tenant };
	},
});

RouterAsync.route('invitation', {
	path: 'invitation/:token',
	template: 'invitationPage',
	async onRun() {
		await import('/imports/ui/pages/invitation');
	},
	waitOn() {
		return [Meteor.subscribe('invitation', this.params?.query?.tenant, this.params?.token)];
	},
	data() {
		const tenantId = this.params?.query?.tenant;
		const invitationToken = this.params?.token;
		if (!tenantId || !invitationToken) {
			return undefined;
		}

		const tenant = Tenants.findOne({ _id: tenantId });
		if (!tenant) {
			return undefined;
		}

		const invitation = Invitations.findOne({
			tenant: tenantId,
			token: invitationToken,
		});
		if (!invitation) {
			return undefined;
		}

		return { tenant, invitation };
	},
});

RouterAsync.route('timetable', {
	path: '/kiosk/timetable',
	template: 'kioskTimetablePage',
	layoutTemplate: 'kioskLayout',
	async onRun() {
		await import('/imports/ui/pages/kiosk/timetable');
	},
	waitOn() {
		return Meteor.subscribe('Events.findFilter', makeFilterQuery(this.params.query), 200);
	},
	data() {
		const query = makeFilterQuery(this.params.query);

		let start: moment.MomentInput;
		let end: moment.MomentInput;

		const events = Events.findFilter(query, 200).fetch();

		// collect time when first event starts and last event ends
		events.forEach((event) => {
			if (!start || event.start < start) {
				start = event.start;
			}
			if (!end || end < event.end) {
				end = event.end;
			}
		});

		if (!start || !end) {
			return [];
		}

		start = moment(start).startOf('hour');
		end = moment(end).startOf('hour');

		const timestampStart = start.toDate().getTime();
		const timestampEnd = end.toDate().getTime();

		const span = timestampEnd - timestampStart;

		const days: { [day: string]: { moment: moment.Moment; relStart: number; relEnd: number } } = {};
		const hours: { [hour: string]: { moment: moment.Moment; relStart: number; relEnd: number } } =
			{};
		const cursor = moment(start);
		do {
			const month = cursor.month();
			const day = cursor.day();
			days[`${month}${day}`] = {
				moment: moment(cursor).startOf('day'),
				relStart: Math.max(
					-0.1,
					(moment(cursor).startOf('day').toDate().getTime() - timestampStart) / span,
				),
				relEnd: Math.max(
					-0.1,
					(timestampEnd - moment(cursor).startOf('day').add(1, 'day').toDate().getTime()) / span,
				),
			};
			const hour = cursor.hour();
			hours[`${month}${day}${hour}`] = {
				moment: moment(cursor).startOf('hour'),
				relStart: Math.max(
					-0.1,
					(moment(cursor).startOf('hour').toDate().getTime() - timestampStart) / span,
				),
				relEnd: Math.max(
					-0.1,
					(timestampEnd - moment(cursor).startOf('hour').add(1, 'hour').toDate().getTime()) / span,
				),
			};
			cursor.add(1, 'hour');
		} while (cursor.isBefore(end));

		const perVenue: {
			[venue: string]: {
				venue: VenueModel;
				perRoom: {
					[room: string]: {
						room: string;
						venue: VenueModel;
						rows: (EventEntity & {
							relStart: number;
							relEnd: number;
						})[];
					};
				};
			};
		} = {};
		const useVenue = function (venue: any, room: any) {
			const id = venue._id || `#${venue.name}`;
			if (!perVenue[id]) {
				perVenue[id] = {
					venue,
					perRoom: {
						[room]: {
							room,
							venue,
							rows: [],
						},
					},
				};
			} else if (!perVenue[id].perRoom[room]) {
				perVenue[id].perRoom[room] = {
					room,
					venue,
					rows: [],
				};
			}
			return perVenue[id].perRoom[room].rows;
		};

		events.forEach((originalEvent) => {
			const event: any = {
				...originalEvent,
			};
			event.relStart = (event.start.getTime() - timestampStart) / span;
			event.relEnd = (timestampEnd - event.end.getTime()) / span;
			let placed = false;

			const room = event.room || null;
			const roomRows = useVenue(event.venue, room);
			roomRows.forEach((roomRow: any) => {
				let last: any;
				roomRow.forEach((placedEvent: any) => {
					if (!last || placedEvent.end > last) {
						last = placedEvent.end;
					}
				});
				if (last <= event.start) {
					roomRow.push(event);
					placed = true;
					return false;
				}
				return true;
			});
			if (!placed) {
				roomRows.push([event] as any);
			}
		});

		// Transform the "rows" objects to arrays and sort the room rows by
		// the room name, so "null" (meaning no room) comes first.
		const grouped = Object.values(perVenue).map((venueData) => {
			const perRoom = Object.values(venueData.perRoom).sort();
			return { ...venueData, perRoom };
		});

		return {
			days: Object.values(days),
			hours: Object.values(hours),
			grouped,
		};
	},
});

RouterAsync.route('userprofile', {
	path: 'user/:_id/:username?',
	template: 'userprofilePage',
	async onRun() {
		await import('/imports/ui/pages/userprofile');
	},
	waitOn() {
		(this as any).groups = Groups.findFilter.subscribe({ own: true });
		return [Meteor.subscribe('user', this.params._id), () => (this as any).groups.ready()];
	},
	data() {
		const user = Users.findOne({ _id: this.params._id as string });
		if (!user) {
			return undefined; // not loaded?
		}

		// What privileges the user has
		const privileges = (['admin'] as ['admin']).reduce<{ [role: string]: boolean }>(
			(originalPs, p) => {
				const ps = { ...originalPs };
				ps[p] = UserPrivilegeUtils.privileged(user, p);
				return ps;
			},
			{},
		);

		const alterPrivileges = UserPrivilegeUtils.privilegedTo('admin');
		const showPrivileges = alterPrivileges || user.privileges?.length;

		return {
			user,
			alterPrivileges,
			privileges,
			inviteGroups: (this as any).groups(),
			showPrivileges,
		};
	},
});

RouterAsync.route('regionCreate', {
	path: 'region/create',
	template: 'regionDetailsPage',
	async onRun() {
		await import('/imports/ui/pages/region-details');
	},
	data() {
		const region = new Region() as RegionModel;

		const tenantId = this.params.query.tenant;

		if (!tenantId) {
			return undefined;
		}

		region.tenant = tenantId;
		region.tz = momentTz.tz.guess();
		return {
			isNew: true,
			region,
		};
	},
});

RouterAsync.route('regionDetails', {
	path: 'region/:_id/:slug?',
	template: 'regionDetailsPage',
	async onRun() {
		await import('/imports/ui/pages/region-details');
	},
	subscriptions() {
		return { details: Regions.details.subscribe(this.params._id as string) };
	},
	data() {
		const region = this.subscriptions().details();

		if (!region) {
			return undefined; // Not found
		}

		return { region };
	},
});

RouterAsync.route('venueDetails', {
	path: 'venue/:_id/:slug?',
	template: 'venueDetailsPage',
	async onRun() {
		await import('/imports/ui/pages/venue-details');
	},
	subscriptions() {
		return { details: Venues.details.subscribe(this.params._id as string) };
	},
	data() {
		const id = this.params._id;

		let venue: VenueModel | undefined;
		if (id === 'create') {
			venue = new Venue() as VenueModel;
		} else {
			venue = this.subscriptions().details();
			if (!venue) {
				return undefined; // Not found
			}
		}

		return { venue };
	},
});

RouterAsync.route('venuesMap', {
	path: 'venues',
	template: 'venuesMapPage',
	async onRun() {
		await import('/imports/ui/pages/venues-map');
	},
	waitOn() {
		return Meteor.subscribe('venues', CleanedRegion(Session.get('region')));
	},
});
