Router.map(function () {
	this.route('showCourse', {
		path: 'course/:_id/:slug?',
		template: 'courseDetailsPage',
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
								showServerError('Saving the course went wrong', err);
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
								showServerError('Saving the course went wrong', err);
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


Template.courseDetailsPage.helpers({    // more helpers in course.roles.js
	currentUserMayEdit: function() {
		return this.editableBy(Meteor.user());
	},
	coursestate: function() {
		if (this.nextEvent) return 'hasupcomingevents';
		if (this.lastEvent) return 'haspastevents';
		return 'proposal';
	},
	mobileViewport: function() {
		return Session.get('screenSize') <= 992; // @screen-md
	},
	isProposal: function() {
		return !this.course.nextEvent;
	}
});

Template.courseDetailsPage.events({
	'click .js-delete-course-btn': function () {
		var self = this;
		if (pleaseLogin()) return;
		if (confirm(mf("course.detail.remove", "Remove course and all its events?"))) {
			Meteor.call('remove_course', this._id, function(error) {
				if (error) {
					showServerError("Removing the proposal '"+ self.name + "' went wrong", error);
				} else {
					addMessage(mf('course.detail.remove.success', { NAME: self.name }, 'The proposal "{NAME}" was obliterated!'), 'success');
				}
			});
			Router.go('/');
		}
	},

	'click .js-edit-course-btn': function () {
		if (pleaseLogin()) return;
		Router.go('showCourse', this, { query: {edit: 'course'} });
	}
});


Template.courseGroupList.helpers({
	'isOrganizer': function() {
		return Template.instance().data.groupOrganizers.indexOf(_id(this)) >= 0;
	},
	'tools': function() {
		var tools = [];
		var user = Meteor.user();
		var groupId = String(this);
		var course = Template.parentData();
		if (user && user.mayPromoteWith(groupId) || course.editableBy(user)) {
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
	'click .js-add-group': function(event, instance) {
		Meteor.call('course.promote', instance.data._id, event.target.value, true, function(error) {
			if (error) {
				showServerError("Failed to add group", error);
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
				showServerError("Failed to remove group", error);
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
				showServerError("Failed to give group editing rights", error);
			} else {
				addMessage(mf('course.group.groupMadeOrganizer', "Group members can now edit this"), 'success');
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
				showServerError("Failed to remove organizer status", error);
			} else {
				addMessage(mf('course.group.removedOrganizer', "Removed editing rights"), 'success');
				instance.collapse();
			}
		});
	}
});
