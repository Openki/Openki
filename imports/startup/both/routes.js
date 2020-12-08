import Courses from '/imports/api/courses/courses';
import Events from '/imports/api/events/events';
import Groups from '/imports/api/groups/groups';
import Roles from '/imports/api/roles/roles';
import Venues, { Venue } from '/imports/api/venues/venues'; // Use default and { named, ... } exports

import Analytics from '/imports/ui/lib/analytics';
import CleanedRegion from '/imports/ui/lib/cleaned-region';
import CourseTemplate from '/imports/ui/lib/course-template';
import CssFromQuery from '/imports/ui/lib/css-from-query';

import Filtering from '/imports/utils/filtering';
import { HasRoleUser } from '/imports/utils/course-role-utils';
import LocalTime from '/imports/utils/local-time';
import Metatags from '/imports/utils/metatags';
import Predicates from '/imports/utils/predicates';
import Profile from '/imports/utils/profile';
import UserPrivilegeUtils from '/imports/utils/user-privilege-utils';

function finderRoute(path) {
	return {
		path,
		template: 'findWrap',
		yieldRegions: {
			featuredGroup: { to: 'aboveContent' },
		},
		data() {
			const { query } = this.params;

			// Add filter options for the homepage
			return _.extend(query, {
				internal: false,
				region: Session.get('region'),
			});
		},
		onAfterAction() {
			const { search } = this.params.query;
			if (search) {
				Metatags.setCommonTags(mf('find.windowtitle', { SEARCH: search }, 'Find "{SEARCH}"'));
			} else {
				Metatags.setCommonTags(mf('find.WhatLearn?'));
			}
		},
	};
}

const makeFilterQuery = function (params) {
	const filter = Events.Filtering().read(params).done();

	const query = filter.toQuery();

	let start;
	if (params.start) {
		start = moment(params.start);
	}
	if (!start || !start.isValid()) {
		start = moment(minuteTime.get()).startOf('day');
	}

	let end;
	if (params.end) {
		end = moment(params.end);
	}
	if (!end || !end.isValid()) {
		end = moment(start).add(1, 'day');
	}

	query.period = [start.toDate(), end.toDate()];

	return query;
};

function loadroles(course) {
	const userId = Meteor.userId();
	return _.reduce(Roles, (goodroles, roletype) => {
		const role = roletype.type;
		const sub = HasRoleUser(course.members, role, userId);
		if (course.roles && course.roles.indexOf(role) !== -1) {
			goodroles.push({
				roletype,
				role,
				subscribed: Boolean(sub),
				course,
			});
		}
		return goodroles;
	}, []);
}

if (Meteor.isClient) {
	Analytics.installRouterActions(Router);
}

/* eslint-disable-next-line array-callback-return */
Router.map(function () {
	this.route('adminPanel', {
		path: 'admin',
		template: 'adminPanel',
	});

	this.route('calendar', {
		path: 'calendar',
		template: 'calendar',
		data() { return this.params; },
		onAfterAction() {
			Metatags.setCommonTags(mf('calendar.windowtitle', 'Calendar'));
		},
	});

	this.route('FAQ', {
		path: '/FAQ',
		template: 'FAQ',
	});

	this.route('featureGroup', {
		path: 'admin/feature-group',
		template: 'featureGroup',
	});

	this.route('find', finderRoute('/find'));

	this.route('frameCalendar', {
		path: '/frame/calendar',
		template: 'frameCalendar',
		layoutTemplate: 'frameLayout',
		data() {
			const cssRules = new CssFromQuery(this.params.query).getCssRules();
			return { cssRules };
		},
		onAfterAction() {
			Metatags.setCommonTags(mf('calendar.windowtitle', 'Calendar'));
		},
	});

	this.route('frameCourselist', {
		path: '/frame/courselist',
		template: 'frameCourselist',
		layoutTemplate: 'frameLayout',
	});

	this.route('frameEvents', {
		path: '/frame/events',
		template: 'frameEvents',
		layoutTemplate: 'frameLayout',
		waitOn() {
			this.filter = Events.Filtering().read(this.params.query).done();

			const filterParams = this.filter.toParams();
			filterParams.after = minuteTime.get();

			const limit = parseInt(this.params.query.count, 10) || 6;

			return Meteor.subscribe('Events.findFilter', filterParams, limit * 2);
		},

		data() {
			const filterParams = this.filter.toParams();
			filterParams.after = minuteTime.get();

			const limit = parseInt(this.params.query.count, 10) || 6;

			return Events.findFilter(filterParams, limit);
		},

		onAfterAction() {
			Metatags.setCommonTags(mf('event.list.windowtitle', 'Events'));
		},
	});

	this.route('framePropose', {
		path: '/frame/propose',
		template: 'framePropose',
		layoutTemplate: 'frameLayout',
		waitOn: () => Meteor.subscribe('regions'),
		data() {
			const predicates = {
				region: Predicates.id,
				group: Predicates.id,
				neededRoles: Predicates.ids,
				internal: Predicates.flag,
			};
			const params = Filtering(predicates).read(this.params.query).done().toQuery();

			if (!params.neededRoles) {
				params.neededRoles = ['mentor'];
			}
			params.roles = ['mentor', 'host'].filter(
				role => params.neededRoles.includes(role),
			);
			delete params.neededRoles;

			params.isFrame = true;

			return params;
		},
		onAfterAction() {
			Metatags.setCommonTags(
				mf('course.propose.windowtitle', 'Propose new course'),
			);
		},
	});

	this.route('frameSchedule', {
		path: '/frame/schedule',
		layoutTemplate: 'frameLayout',
	});

	this.route('frameWeek', {
		path: '/frame/week',
		template: 'frameWeek',
		layoutTemplate: 'frameWeek',
		onAfterAction() {
			Metatags.setCommonTags(mf('calendar.windowtitle', 'Calendar'));
		},
	});

	this.route('groupDetails', {
		path: 'group/:_id/:short?',
		waitOn() {
			return [
				Meteor.subscribe('group', this.params._id),
			];
		},
		data() {
			let group;
			const isNew = this.params._id === 'create';
			if (isNew) {
				group = { _id: 'create' };
			} else {
				group = Groups.findOne(this.params._id);
			}

			if (!group) {
				return false;
			}

			const courseQuery = Object.assign(this.params.query, {
				group: group._id,
				region: Session.get('region'),
			});

			return {
				courseQuery, group, isNew, showCourses: !isNew,
			};
		},
		onAfterAction() {
			const group = Groups.findOne({ _id: this.params._id });
			if (group) {
				Metatags.setCommonTags(group.name);
			}
		},
	});

	this.route('home', finderRoute('/'));

	this.route('kioskEvents', {
		path: '/kiosk/events',
		layoutTemplate: 'kioskLayout',
		waitOn() {
			const now = minuteTime.get(); // Time dependency so this will be reactively updated

			this.filter = Events.Filtering().read(this.params.query).done();
			Session.set('kioskFilter', this.filter.toParams());

			const queryFuture = this.filter.toParams();
			queryFuture.after = now;

			const queryOngoing = this.filter.toParams();
			queryOngoing.ongoing = now;

			return [
				Meteor.subscribe('Events.findFilter', queryFuture, 20),
				Meteor.subscribe('Events.findFilter', queryOngoing),
			];
		},

		data() {
			const now = minuteTime.get();
			const tomorrow = new Date(now);
			tomorrow.setHours(tomorrow.getHours() + 24);
			tomorrow.setHours(0);

			const queryFuture = this.filter.toParams();
			queryFuture.after = tomorrow;

			const queryToday = this.filter.toParams();
			queryToday.after = now;
			queryToday.before = tomorrow;

			const queryNow = this.filter.toParams();
			queryNow.ongoing = now;

			const filterParams = this.filter.toParams();
			return {
				today: Events.findFilter(queryToday, 20),
				future: Events.findFilter(queryFuture, 10),
				ongoing: Events.findFilter(queryNow),
				filter: filterParams,
			};
		},
		onAfterAction() {
			this.timer = Meteor.setInterval(() => {
				Session.set('seconds', new Date());
			}, 1000);
			Metatags.setCommonTags(mf('event.list.windowtitle', 'Events'));
		},
		unload() {
			Meteor.clearInterval(this.timer);
		},
	});

	this.route('log', {
		path: '/log',
		template: 'showLog',
		data() {
			return this.params.query;
		},
		onAfterAction() {
			Metatags.setCommonTags(mf('log.list.windowtitle', 'Log'));
		},
	});

	this.route('pages', { // /////// static /////////
		path: 'page/:page_name',
		action() {
			this.render(this.params.page_name);
		},
		onAfterAction() {
			Metatags.setCommonTags(this.params.page_name);
		},
	});

	this.route('profile', {
		path: 'profile',
		waitOn() {
			return [
				Meteor.subscribe('groupsFind', { own: true }),
				Meteor.subscribe('Venues.findFilter', { editor: Meteor.userId() }),
			];
		},
		data() {
			const data = {};
			const user = Meteor.user();
			data.loggedIn = Boolean(user);
			if (data.loggedIn) {
				const userdata = {
					_id: user._id,
					name: user.username,
					privacy: user.privacy,
					notifications: user.notifications,
					groups: Groups.findFilter({ own: true }),
					venues: Venues.find({ editor: user._id }),
				};
				userdata.have_email = user.emails?.length > 0;
				if (userdata.have_email) {
					userdata.email = user.emails[0].address;
					userdata.verified = Boolean(user.emails[0].verified);
				}

				data.user = userdata;
				data.involvedIn = Courses.findFilter({ userInvolved: user._id });
			}
			return data;
		},
		onAfterAction() {
			const user = Meteor.user();
			if (user) {
				const title = mf('profile.settings.windowtitle', { USER: user.username }, 'My Profile Settings - {USER}');
				Metatags.setCommonTags(title);
			}
		},
	});

	this.route('proposeCourse', {
		path: 'courses/propose',
		template: 'proposeCourse',
		onAfterAction() {
			Metatags.setCommonTags(mf('course.propose.windowtitle', 'Propose new course'));
		},
		data: CourseTemplate,
	});

	this.route('resetPassword', {
		path: 'reset-password/:token',
		data() {
			return this.params.token;
		},
		onAfterAction() {
			document.title = mf('resetPassword.siteTitle', 'Reset password');
		},
	});

	this.route('showCourse', {
		path: 'course/:_id/:slug?',
		template: 'courseDetailsPage',
		waitOn() {
			return Meteor.subscribe('courseDetails', this.params._id);
		},
		data() {
			const course = Courses.findOne({ _id: this.params._id });

			if (!course) {
				return false;
			}

			function getMember(members, user) {
				if (!members) {
					return false;
				}
				let member = false;
				members.every((memberCandidate) => {
					if (memberCandidate.user === user) {
						member = memberCandidate;
						return false; // break
					}
					return true;
				});
				return member;
			}

			const userId = Meteor.userId();
			const member = getMember(course.members, userId);
			const data = {
				edit: Boolean(this.params.query.edit),
				roles_details: loadroles(course),
				course,
				member,
				select: this.params.query.select,
			};
			return data;
		},
		onAfterAction() {
			const data = this.data();
			if (data) {
				const { course } = data;
				Metatags.setCommonTags(mf('course.windowtitle', { COURSE: course.name }, 'Course: {COURSE}'));
			}
		},
	});

	this.route('showCourseHistory', {
		path: 'course/:_id/:slug/History',
		// template: 'coursehistory',
		waitOn() {
			return [
				Meteor.subscribe('courseDetails', this.params._id),
			];
		},
		data() {
			const course = Courses.findOne({ _id: this.params._id });
			return {
				course,
			};
		},
	});

	this.route('showEvent', {
		path: 'event/:_id/:slug?',
		template: 'eventPage',
		notFoundTemplate: 'eventNotFound',
		waitOn() {
			const subs = [
				Meteor.subscribe('event', this.params._id),
			];
			const { courseId } = this.params.query;
			if (courseId) {
				subs.push(Meteor.subscribe('courseDetails', courseId));
			}
			return subs;
		},
		data() {
			let event;
			const create = this.params._id === 'create';
			if (create) {
				const propose = LocalTime.now().add(1, 'week').startOf('hour');
				event = {
					new: true,
					startLocal: LocalTime.toString(propose),
					endLocal: LocalTime.toString(moment(propose).add(2, 'hour')),
				};
				const course = Courses.findOne(this.params.query.courseId);
				if (course) {
					event.title = course.name;
					event.courseId = course._id;
					event.region = course.region;
					event.description = course.description;
					event.internal = course.internal;
				}
			} else {
				event = Events.findOne({ _id: this.params._id });
				if (!event) {
					return false;
				}
			}

			return event;
		},
	});

	this.route('stats', {
		path: 'stats',
		template: 'stats',
	});

	this.route('timetable', {
		path: '/kiosk/timetable',
		layoutTemplate: 'timetableLayout',
		waitOn() {
			return Meteor.subscribe('Events.findFilter', makeFilterQuery(this.params && this.params.query), 200);
		},
		data() {
			const query = makeFilterQuery(this.params.query);

			let start;
			let end;

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
			const days = {};
			const hours = {};
			const cursor = moment(start);
			do {
				const month = cursor.month();
				const day = cursor.day();
				days[`${month}${day}`] = {
					moment: moment(cursor).startOf('day'),
					relStart: Math.max(-0.1, (moment(cursor).startOf('day').toDate().getTime() - timestampStart) / span),
					relEnd: Math.max(-0.1, (timestampEnd - moment(cursor).startOf('day').add(1, 'day').toDate()
						.getTime()) / span),
				};
				const hour = cursor.hour();
				hours[`${month}${day}${hour}`] = {
					moment: moment(cursor).startOf('hour'),
					relStart: Math.max(-0.1, (moment(cursor).startOf('hour').toDate().getTime() - timestampStart) / span),
					relEnd: Math.max(-0.1, (timestampEnd - moment(cursor).startOf('hour').add(1, 'hour').toDate()
						.getTime()) / span),
				};
				cursor.add(1, 'hour');
			} while (cursor.isBefore(end));

			const perVenue = {};
			const useVenue = function (venue) {
				const id = venue._id || `#${venue.name}`;
				if (!perVenue[id]) {
					perVenue[id] = {
						venue,
						rows: [],
					};
				}
				return perVenue[id].rows;
			};

			events.forEach((originalEvent) => {
				const event = Object.assign({}, originalEvent);
				event.relStart = (event.start.getTime() - timestampStart) / span;
				event.relEnd = (timestampEnd - event.end.getTime()) / span;
				let placed = false;

				const venueRows = useVenue(event.venue);
				venueRows.forEach((venueRow) => {
					let last;
					venueRow.forEach((placedEvent) => {
						if (!last || placedEvent.end > last) {
							last = placedEvent.end;
						}
					});
					if (last <= event.start) {
						venueRow.push(event);
						placed = true;
						return false;
					}
					return true;
				});
				if (!placed) {
					venueRows.push([event]);
				}
			});

			return {
				days: _.toArray(days),
				hours: _.toArray(hours),
				grouped: _.toArray(perVenue),
			};
		},
	});

	this.route('userprofile', {
		path: 'user/:_id/:username?',
		waitOn() {
			return [
				Meteor.subscribe('user', this.params._id),
				Meteor.subscribe('groupsFind', { own: true }),
			];
		},
		data() {
			const user = Meteor.users.findOne({ _id: this.params._id });
			if (!user) {
				return false; // not loaded?
			}

			// What privileges the user has
			const privileges = _.reduce(['admin'], (originalPs, p) => {
				const ps = Object.assign({}, originalPs);
				ps[p] = UserPrivilegeUtils.privileged(user, p);
				return ps;
			}, {});

			const alterPrivileges = UserPrivilegeUtils.privilegedTo('admin');
			const showPrivileges = alterPrivileges || (user.privileges && user.privileges.length);

			return {
				user,
				alterPrivileges,
				privileges,
				inviteGroups: Groups.findFilter({ own: true }),
				showPrivileges,
			};
		},
		onAfterAction() {
			const user = Meteor.users.findOne({ _id: this.params._id });
			if (!user) return; // wtf

			const title = mf('profile.windowtitle', { USER: user.username }, 'Profile of {USER}');
			Metatags.setCommonTags(title);
		},
	});

	this.route('venueDetails', {
		path: 'venue/:_id/:name?',
		waitOn() {
			return [
				Meteor.subscribe('venueDetails', this.params._id),
			];
		},

		data() {
			const id = this.params._id;

			let venue;
			const data = {};
			if (id === 'create') {
				const userId = Meteor.userId();
				venue = new Venue();
				venue.region = CleanedRegion(Session.get('region'));
				venue.editor = userId;
			} else {
				venue = Venues.findOne({ _id: this.params._id });
				if (!venue) {
					return false; // Not found
				}
			}

			data.venue = venue;

			return data;
		},

		onAfterAction() {
			const data = this.data();
			if (!data) {
				return;
			}

			const { venue } = data;
			let title;
			if (venue._id) {
				title = venue.name;
			} else {
				title = mf('venue.edit.siteTitle.create', 'Create Venue');
			}
			Metatags.setCommonTags(title);
		},
	});

	this.route('venueMap', {
		path: 'venues',
		template: 'venueMap',
		waitOn() {
			return Meteor.subscribe('venues', CleanedRegion(Session.get('region')));
		},
		onAfterAction() {
			Metatags.setCommonTags(mf('venue.map.windowtitle', 'Venues map'));
		},
	});
});

Router.route('/profile/unsubscribe/:token', function () {
	const unsubToken = this.params.token;

	const accepted = Profile.Notifications.unsubscribe(unsubToken);

	const query = {};
	if (accepted) {
		query.unsubscribed = '';
	} else {
		query['unsubscribe-error'] = '';
	}

	this.response.writeHead(302, {
		Location: Router.url('profile', {}, { query }),
	});

	this.response.end();
}, {
	name: 'profile.unsubscribe',
	where: 'server',
});
