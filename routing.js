import '/imports/Profile.js';
import '/imports/LocalTime.js';
import Metatags from '/imports/Metatags.js';

Router.configure({
	layoutTemplate: 'layout',
	notFoundTemplate: 'notFound',
	loadingTemplate: 'loadingPage',
});
Router.onBeforeAction('dataNotFound');

Router.onBeforeAction(function() {
	Metatags.removeAll();
	this.next();
});

Router.map(function () {
	this.route('pages', {									///////// static /////////
		path: 'page/:page_name',
		action: function() {
			this.render(this.params.page_name);
		},
		onAfterAction: function() {
			Metatags.setCommonTags(this.params.page_name);
		}
	});

});


Router.map(function() {
	this.route('userprofile', {
		path: 'user/:_id/:username?',
		waitOn: function () {
			return [
				Meteor.subscribe('user', this.params._id),
				Meteor.subscribe('groupsFind', { own: true }),
			];
		},
		data: function () {
			var user = Meteor.users.findOne({_id: this.params._id});
			if (!user) return; // not loaded?

			// What privileges the user has
			var privileges = _.reduce(['admin'], function(ps, p) {
				ps[p] = privileged(user, p);
				return ps;
			}, {});

			var alterPrivileges = privilegedTo('admin');
			var showPrivileges = alterPrivileges || (user.privileges && user.privileges.length);

			return {
				'user': user,
				'alterPrivileges': alterPrivileges,
				'privileges': privileges,
				'inviteGroups': GroupLib.find({ own: true }),
				'showPrivileges': showPrivileges
			};
		},
		onAfterAction: function() {
			var user = Meteor.users.findOne({_id: this.params._id});
			if (!user) return; // wtf
			const title = mf('profile.windowtitle', {USER: user.username}, '{USER}\'s Profile');
			Metatags.setCommonTags(title);
		}
	});
});


Router.map(function () {
	this.route('showEvent', {
		path: 'event/:_id/:slug?',
		template: 'eventPage',
		notFoundTemplate: 'eventNotFound',
		waitOn: function () {
			var subs = [
				Meteor.subscribe('event', this.params._id)
			];
			var courseId = this.params.query.courseId;
			if (courseId) {
				subs.push(Meteor.subscribe('courseDetails', courseId));
			}
			return subs;
		},
		data: function () {
			var event;
			var create = 'create' == this.params._id;
			if (create) {
				var propose = LocalTime.now().add(1, 'week').startOf('hour');
				event = {
					new: true,
					startLocal: LocalTime.toString(propose),
					endLocal: LocalTime.toString(moment(propose).add(2, 'hour')),
				};
				var course = Courses.findOne(this.params.query.courseId);
				if (course) {
					event.title = course.name;
					event.courseId = course._id;
					event.region = course.region;
					event.description = course.description;
					event.internal = course.internal;
				}
			} else {
				event = Events.findOne({_id: this.params._id});
				if (!event) return false;
			}

			return event;
		},
		onAfterAction: function() {
			const event = Events.findOne({_id: this.params._id});
			let title;
			let description = '';
			if (event) {
				title = mf('event.windowtitle', {EVENT:event.title, DATE: moment(event.start).calendar()}, '{DATE} {EVENT}');
				description = mf('event.metatag.description', {
					REGION: Regions.findOne({_id: event.region}).name,
					VENUE: event.venue.name
				}, '{VENUE} in {REGION}');
			} else {
				title = mf('event.windowtitle.create', 'Create event');
			}
			Metatags.setCommonTags(title, description);
		}
	});
});


function loadroles(course) {
	var userId = Meteor.userId();
	return _.reduce(Roles, function(goodroles, roletype) {
		var role = roletype.type;
		var sub = hasRoleUser(course.members, role, userId);
		if (course.roles && course.roles.indexOf(role) !== -1) {
			goodroles.push({
				roletype: roletype,
				role: role,
				subscribed: !!sub,
				course: course
			});
		}
		return goodroles;
	}, []);
}


Router.map(function () {
	this.route('showCourse', {
		path: 'course/:_id/:slug?',
		template: 'courseDetailsPage',
		waitOn: function () {
			return subs.subscribe('courseDetails', this.params._id);
		},
		data: function() {
			var course = Courses.findOne({_id: this.params._id});

			if (!course) return false;

			var userId = Meteor.userId();
			var member = getMember(course.members, userId);
			var data = {
				edit: !!this.params.query.edit,
				roles_details: loadroles(course),
				course: course,
				member: member,
				select: this.params.query.select
			};
			return data;
		},
		onAfterAction: function() {
			var data = this.data();
			if (data) {
				var course = data.course;
				Metatags.setCommonTags(mf('course.windowtitle', {COURSE: course.name}, 'Course: {COURSE}'));
			}
		}
	});

	this.route('showCourseHistory', {
		path: 'course/:_id/:slug/History',
		//template: 'coursehistory',
		waitOn: function () {
			return [
				Meteor.subscribe('courseDetails', this.params._id)
			];
		},
		data: function () {
			var course = Courses.findOne({_id: this.params._id});
			return {
				course: course
			};
		}
	});
});



Router.map(function () {
	this.route('profile', {
		path: 'profile',
		waitOn: function () {
			return [
				Meteor.subscribe('groupsFind', { own: true }),
				Meteor.subscribe('venuesFind', { editor: Meteor.userId() })
			];
		},
		data: function () {
			var data = {};
			var user = Meteor.user();
			data.loggedIn = !!user;
			if (data.loggedIn) {
				var userdata = {
					_id: user._id,
					name: user.username,
					privacy: user.privacy,
					notifications: user.notifications,
					groups: GroupLib.find({ own: true }),
					venues: Venues.find({ editor: user._id })
				};
				userdata.have_email = user.emails && user.emails.length > 0;
				if (userdata.have_email) {
					userdata.email = user.emails[0].address;
					userdata.verified = !!user.emails[0].verified;
				}

				data.user = userdata;
				data.involvedIn = coursesFind({ userInvolved: user._id });
			}
			return data;
		},
		onAfterAction: function() {
			var user = Meteor.users.findOne();
			if (!user) return;
			Metatags.setCommonTags(mf('profile.settings.windowtitle', {USER: user.username}, 'My Profile Settings - {USER}'));
		}
	});
});

Router.map(function () {
	this.route('groupDetails', {
		path: 'group/:_id/:short?',
		waitOn: function () {
			return [
				subs.subscribe('group', this.params._id),
			];
		},
		data: function () {
			var group;
			var isNew = this.params._id === 'create';
			if (isNew) {
				group = {
					_id: 'create'
				};
			} else {
				group = Groups.findOne({_id: this.params._id});
			}

			if (!group) return false;

			var data = {
				group: group,
				courseQuery: _.extend(this.params.query, {group: group._id}),
				isNew: isNew,
				showCourses: !isNew,
			};


			return data;
		},
		onAfterAction: function() {
			var group = Groups.findOne({_id: this.params._id});
			if (group) {
				Metatags.setCommonTags(group.name);
			}
		}
	});
});


Router.map(function() {
	this.route('venueDetails', {
		path: 'venue/:_id/:name?',
		waitOn: function () {
			return [
				Meteor.subscribe('venueDetails', this.params._id),
			];
		},

		data: function() {
			var id = this.params._id;

			var venue;
			var data = {};
			if (id === 'create') {
				var userId = Meteor.userId();
				venue = new Venue();
				venue.region = cleanedRegion(Session.get('region'));
				venue.editor = userId;
			} else {
				venue = Venues.findOne({_id: this.params._id});
				if (!venue) return false; // Not found
			}

			data.venue = venue;

			return data;
		},

		onAfterAction: function() {
			var data = this.data();
			if (!data) return;

			var venue = data.venue;
			var title;
			if (venue._id) {
				title = venue.name;
			} else {
				title = mf('venue.edit.siteTitle.create', "Create Venue");
			}
			Metatags.setCommonTags(title);
		}
	});
});


Router.route('/profile/unsubscribe/:token', function() {

	var unsubToken = this.params.token;

	var accepted = Profile.Notifications.unsubscribe(unsubToken);

	var query = {};
	if (accepted) {
		query.unsubscribed = '';
	} else {
		query['unsubscribe-error'] = '';
	}

	this.response.writeHead(302, {
		'Location': Router.url('profile', {}, { query: query })
	});

	this.response.end();
}, {
	name: 'profile.unsubscribe',
	where: 'server'
});
