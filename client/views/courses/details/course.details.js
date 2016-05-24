Router.map(function () {
	this.route('showCourse', {
		path: 'course/:_id/:slug?',
		template: 'coursedetails',
		waitOn: function () {
			return subs.subscribe('courseDetails', this.params._id);
		},
		data: function() {
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
			if (course.editableBy(Meteor.user())) {
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
					mf('course.title.placeholder')
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
	});

	this.route('showCourseDocs', {
		path: 'course/:_id/:slug/docs',
		//template: 'coursedocs',
		waitOn: function () {
			return [
				Meteor.subscribe('courseDetails', this.params._id),
			];
		},
		data: function () {
			var course = Courses.findOne({_id: this.params._id});
			return {
				course: course
			};
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

function loadroles(course) {
	var userId = Meteor.userId();
	return _.reduce(Roles.find({}, {sort: {type: 1} }).fetch(), function(goodroles, roletype) {
		var role = roletype.type;
		var sub = hasRoleUser(course.members, role, userId);
		if (course.roles && course.roles.indexOf(role) !== -1) {
			goodroles.push({
				roletype: roletype,
				role: role,
				subscribed: !!sub,
				anonsub: sub == 'anon',
				course: course
			});
		}
		return goodroles;
	}, []);
}


Template.coursedetails.helpers({    // more helpers in course.roles.js
	currentUserMayEdit: function() {
		return this.editableBy(Meteor.user());
	},
	coursestate: function() {
		if (this.nextEvent) return 'hasupcomingevents';
		if (this.lastEvent) return 'haspastevents';
		return 'proposal';
	},
	mobileViewport: function() {
		return Session.get('screenSize') <= 480; // @screen-xs
	},
	isProposal: function() {
		return !this.course.nextEvent;
	}
});


Template.show_course_submenu.helpers({
	hasFiles: function() {
		var withFiles = { courseId: this.course._id, files: {$exists: 1, $not: {$size: 0}} };
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
		Router.go('showCourse', this, { query: {edit: 'course'} });
	}
});


Template.coursedetails.rendered = function() {
	this.$("[data-toggle='tooltip']").tooltip();
	var currentPath = Router.current().route.path(this);
	$('a[href!="' + currentPath + '"].nav_link').removeClass('active');
	$('#nav_courses').addClass('active');
};


Template.courseGroupList.helpers({
	'isOrganizer': function() {
		return Template.instance().data.groupOrganizers.indexOf(_id(this)) >= 0;
	},
	'tools': function() {
		var tools = [];
		var user = Meteor.user();
		var groupId = String(this);
		var course = Template.parentData();
		if (user && user.mayPromoteWith(groupId)) {
			tools.push({
				toolTemplate: Template.courseGroupRemove,
				groupId: groupId,
				course: course,
			});
		}
		if (user && course.editableBy(user)) {
			var hasOrgRights = course.groupOrganizers.indexOf(groupId) > -1;
			tools.push({
				toolTemplate: hasOrgRights ? Template.courseGroupRemoveOrganizer : Template.courseGroupMakeOrganizer,
				groupId: groupId,
				course: course,
			});
		}
		return tools;
	},
});



TemplateMixins.Expandible(Template.courseGroupAdd);
Template.courseGroupAdd.helpers(groupNameHelpers);
Template.courseGroupAdd.helpers({
	'groupsToAdd': function() {
		var user = Meteor.user();
		return user && _.difference(user.groups, this.groups);
	}
});


Template.courseGroupAdd.events({
	'click .js-add': function(event, instance) {
		Meteor.call('course.promote', instance.data._id, event.target.value, true, function(error) {
			if (error) {
				addMessage(mf('course.group.addFailed', "Failed to add group to course"), 'danger');
			} else {
				addMessage(mf('course.group.addedGroup', "Added your group to the list of promoters"), 'success');
				instance.collapse();
			}
		});
	}
});


TemplateMixins.Expandible(Template.courseGroupRemove);
Template.courseGroupRemove.helpers(groupNameHelpers);
Template.courseGroupRemove.events({
	'click .js-remove': function(event, instance) {
		Meteor.call('course.promote', instance.data.course._id, instance.data.groupId, false, function(error) {
			if (error) {
				addMessage(mf('course.group.removeFailed', "Failed to remove group from course"), 'danger');
			} else {
				addMessage(mf('course.group.removedGroup', "Removed group from the list of promoters"), 'success');
				instance.collapse();
			}
		});
	}
});


TemplateMixins.Expandible(Template.courseGroupMakeOrganizer);
Template.courseGroupMakeOrganizer.helpers(groupNameHelpers);
Template.courseGroupMakeOrganizer.events({
	'click .js-makeOrganizer': function(event, instance) {
		Meteor.call('course.editing', instance.data.course._id, instance.data.groupId, true, function(error) {
			if (error) {
				addMessage(mf('course.group.makeOrganizerFailed', "Failed to give group editing rights"), 'danger');
			} else {
				addMessage(mf('course.group.groupMadeOrganizer', "Group members can now edit the course"), 'success');
				instance.collapse();
			}
		});
	}
});


TemplateMixins.Expandible(Template.courseGroupRemoveOrganizer);
Template.courseGroupRemoveOrganizer.helpers(groupNameHelpers);
Template.courseGroupRemoveOrganizer.events({
	'click .js-removeOrganizer': function(event, instance) {
		Meteor.call('course.editing', instance.data.course._id, instance.data.groupId, false, function(error) {
			if (error) {
				addMessage(mf('course.group.removeOrganizerFailed', "Failed to remove organizer status"), 'danger');
			} else {
				addMessage(mf('course.group.removedOrganizer', "Removed editing rights"), 'success');
				instance.collapse();
			}
		});
	}
});
