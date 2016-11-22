import '/imports/Profile.js';

Router.configure({
	layoutTemplate: 'layout',
	notFoundTemplate: 'notFound',
	loadingTemplate: 'loadingPage',
});
Router.onBeforeAction('dataNotFound');

webpagename = 'Openki - ';                  // global (document title init)

Router.map(function () {
	this.route('pages', {									///////// static /////////
		path: 'page/:page_name',
		action: function() {
			this.render(this.params.page_name);
		},
		onAfterAction: function() {
			document.title = webpagename + '' + this.params.page_name;
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
				var propose = moment().add(1, 'week').startOf('hour');
				event = {
					new: true,
					start: propose.toDate(),
					end: moment(propose).add(2, 'hour').toDate(),
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
			var event = Events.findOne({_id: this.params._id});
			if (event) {
				document.title = webpagename + mf('event.windowtitle', {EVENT:event.title, DATE: moment(event.start).calendar()}, '{DATE} {EVENT}');
			} else {
				document.title = webpagename + mf('event.windowtitle.create', 'Create event');
			}

		}
	});
});


Router.map(function () {
	this.route('profile', {
		path: 'profile',
		waitOn: function () {
			return [
				Meteor.subscribe('currentUser'),
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
			document.title = webpagename + 'My Profile_Settings - ' + user.username;
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