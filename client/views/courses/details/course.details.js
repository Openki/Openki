"use strict";

Router.map(function () {
	this.route('showCourse', {
		path: 'course/:_id/:slug?',
		template: 'coursedetails',
		waitOn: function () {
			return [
				Meteor.subscribe('courseDetails', this.params._id),
				Meteor.subscribe('eventsForCourse', this.params._id),
				Meteor.subscribe('discussion', this.params._id),
				Meteor.subscribe('groupsFind', { own: false }),
				Meteor.subscribe('locationNames')
			];
		},
		data: function () {
			var self = this;
			var course = Courses.findOne({_id: this.params._id});

			if (!course) return false;

			var userId = Meteor.userId();
			var member = getMember(course.members, userId);
			var data = {
				edit: !!this.params.query.edit,
				roles_details: loadroles(course),
				course: course,
				member: member
			};
			if (mayEdit(Meteor.user(), course)) {
				data.editableName = makeEditable(
					course.name,
					true,
					function(newName) {
						Meteor.call("save_course", course._id, { name: newName }, function(err, courseId) {
							if (err) {
								addMessage(mf('course.saving.error', { ERROR: err }, 'Saving the course went wrong! Sorry about this. We encountered the following error: {ERROR}'), 'danger');
							} else {
								addMessage(mf('course.saving.name.editable.success', { NAME: course.name }), 'success');
							}
						});
					},
					mf('course.name.placeholder', 'Name my course proposal')
				);
				data.editableDescription = makeEditable(
					course.description,
					false,
					function(newDescription) {
						Meteor.call("save_course", course._id, { description: newDescription }, function(err, courseId) {
							if (err) {
								addMessage(mf('course.saving.error', { ERROR: err }, 'Saving the course went wrong! Sorry about this. We encountered the following error: {ERROR}'), 'danger');
							} else {
								addMessage(mf('course.saving.desc.editable.success', { NAME: course.name }), 'success');
							}
						});
					},
					mf('course.description.placeholder')
				);
			}
			return data;
		},
		onAfterAction: function() {
			var data = this.data();
			if (data) {
				var course = data.course;
				document.title = webpagename + 'Course: ' + course.name;
			}
		}
	})
	this.route('showCourseDocs', {
		path: 'course/:_id/:slug/docs',
		//template: 'coursedocs',
		waitOn: function () {
			return [
				Meteor.subscribe('courseDetails', this.params._id),
			]
		},
		data: function () {
			var course = Courses.findOne({_id: this.params._id});
			return {
				course: course
			};
		}
	})
	this.route('showCourseHistory', {
		path: 'course/:_id/:slug/History',
		//template: 'coursehistory',
		waitOn: function () {
			return [
				Meteor.subscribe('courseDetails', this.params._id)
			]
		},
		data: function () {
			var course = Courses.findOne({_id: this.params._id})
			return {
				course: course
			};
		}
	})

})

function loadroles(course) {
	var userId = Meteor.userId();
	return _.reduce(Roles.find({}, {sort: {type: 1} }).fetch(), function(goodroles, roletype) {
		var role = roletype.type
		var sub = hasRoleUser(course.members, role, userId);
		if (course.roles && course.roles.indexOf(role) !== -1) {
			goodroles.push({
				roletype: roletype,
				role: role,
				subscribed: !!sub,
				anonsub: sub == 'anon',
				course: course
			})
		}
		return goodroles;
	}, []);
}


Template.coursedetails.helpers({    // more helpers in course.roles.js
	currentUserMayEdit: function() {
		return mayEdit(Meteor.user(), this);
	},
	coursestate: function() {
		var today = new Date();
		var upcoming = Events.find({course_id: this._id, start: {$gt:today}}).count() > 0;
		if (upcoming) return 'hasupcomingevents';

		var past = Events.find({course_id: this._id, start: {$lt:today}}).count() > 0
		if (past) return 'haspastevents';

		return 'proposal';
	},
	mobileViewport: function() {
		var mobile = Math.max(document.documentElement.clientWidth, window.innerWidth || 0) <= 480;
		return mobile;
	},
});

Template.show_course_submenu.helpers({
	hasFiles: function() {
		var withFiles = {course_id: this.course._id, files: {$exists: 1, $not: {$size: 0}}};
		return !!Events.findOne(withFiles);
	},
});

Template.coursedetails.events({
	'click button.del': function () {
		var self = this;
		if (pleaseLogin()) return;
		if (confirm(mf("course.detail.remove", "Remove course and all its events?"))) {
			Meteor.call('remove_course', this._id, function(error) {
				if (error) {
					addMessage(mf('course.detail.remove.error', { ERROR: error, NAME: self.name }, 'Sorry but removing the proposal "{NAME}" went wrong. We encountered the following error: {ERROR}'), 'danger');
				} else {
					addMessage(mf('course.detail.remove.success', { NAME: self.name }, 'The proposal "{NAME}" was obliterated!'), 'success');
				}
			});
			Router.go('/');
		}
	},

	'click button.edit': function () {
		if (pleaseLogin()) return;
		Router.go('showCourse', this, { query: {edit: 'course'} })

	}
})

Template.coursedetails.rendered = function() {
	this.$("[data-toggle='tooltip']").tooltip();
	var currentPath = Router.current().route.path(this)
	$('a[href!="' + currentPath + '"].nav_link').removeClass('active');
	$('#nav_courses').addClass('active');
}
