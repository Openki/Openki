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

			var userId = Meteor.userId();
			var mayEdit = isNew || userId && GroupLib.isMember(userId, group._id);

			var data = {
				group: group,
				courseQuery: _.extend(this.params.query, {group: group._id}),
				isNew: isNew,
				showCourses: !isNew,
				mayEdit: mayEdit
			};

			if (mayEdit) {
				var handleSaving = function(err, groupId) {
					if (err) {
						addMessage(mf('group.saving.error', { ERROR: err }, 'Saving the group went wrong! Sorry about this. We encountered the following error: {ERROR}'), 'danger');
					} else {
						addMessage(mf('group.saving.success', { NAME: group.short }, 'Saved change to {NAME}'), 'success');
					}
				};

				var showControls = !isNew;

				data.editableName = makeEditable(
					group.name,
					true,
					function(newName) {
						Meteor.call("saveGroup", group._id, { name: newName }, handleSaving);
					},
					mf('group.name.placeholder',  'Name of your group, institution, community or program'),
					showControls
				);

				data.editableShort = makeEditable(
					group.short,
					true,
					function(newShort) {
						Meteor.call("saveGroup", group._id, { short: newShort }, handleSaving);
					},
					mf('group.short.placeholder', 'Abbreviation'),
					showControls
				);

				data.editableClaim = makeEditable(
					group.claim,
					true,
					function(newClaim) {
						Meteor.call("saveGroup", group._id, { claim: newClaim }, handleSaving);
					},
					mf('group.claim.placeholder', 'The core idea'),
					showControls
				);

				data.editableDescription = makeEditable(
					group.description,
					false,
					function(newDescription) {
						Meteor.call("saveGroup", group._id, { description: newDescription }, handleSaving);
					},
					mf('group.description.placeholder', 'Describe the audience, the interests and activities of your group.'),
					showControls
				);
			}

			return data;
		},
		onAfterAction: function() {
			var group = Groups.findOne({_id: this.params._id});
			if (group) {
				document.title = webpagename + group.name;
			}
		}
	});
});

Template.groupDetails.onCreated(function() {
	var instance = this;
	instance.editingSettings = new ReactiveVar(false);

	instance.autorun(function() {
		// Close the settings pane when no user is logged-in
		if (!Meteor.userId()) {
			instance.editingSettings.set(false);
		}
	});
});

Template.groupSettings.onCreated(function() {
	var instance = this;
	instance.userSearch = new ReactiveVar('');

	instance.autorun(function() {
		var search = instance.userSearch.get();
		if (search.length > 0) {
			Meteor.subscribe('userSearch', search);
		}
	});
});

Template.groupDetails.helpers({
	editingSettings: function() {
		return Template.instance().editingSettings.get();
	},
});

Template.groupSettings.helpers({
	foundUsers: function() {
		var instance = Template.instance();

		var search = instance.userSearch.get();
		if (search == '') return false;

		var group = Groups.findOne(Router.current().params._id);
		return UserLib.searchPrefix(search, { exclude: group.members, limit: 30 });
	},

	kioskEventURL: function() {
		return Router.routes.kioskEvents.url({}, { query: {group: this._id} });
	},
	kioskTimetableURL: function() {
		return Router.routes.kioskTimetable.url({}, { query: {group: this._id} });
	},
	frameEventsURL: function() {
		return Router.routes.frameEvents.url({}, { query: {group: this._id} });
	},
	frameCalendarURL: function() {
		return Router.routes.frameCalendar.url({}, { query: {group: this._id} });
	},
});


Template.groupDetails.events({

	'click .-settings' : function(event, instance) {
		if (pleaseLogin()) return false
		instance.editingSettings.set(!instance.editingSettings.get());
	},

	'click .-saveGroup': function(event, instance) {
		if (pleaseLogin()) return false;

		var group = {};

		group.name = instance.data.editableName.editedContent();
		group.short = instance.data.editableShort.editedContent();
		group.claim = instance.data.editableClaim.editedContent();
		group.description = instance.data.editableDescription.editedContent();

		Meteor.call("saveGroup", "create", group, function(err, groupId) {
			if (err) {
				var msg = mf('group.saving.error', { ERROR: err });
				addMessage(msg, 'danger');
			} else {
				instance.data.editableName.end();
				instance.data.editableShort.end();
				instance.data.editableClaim.end();
				instance.data.editableDescription.end();

				addMessage(mf('group.create.success', 'Created group'));
				Router.go('groupDetails', { _id: groupId });
			}
		});

	},

	'click .-cancelGroup': function(event, instance) {
		Router.go('/'); // Got a better idea?
	},

	'click .-saveSettings': function(event, instance) {
		Meteor.call("saveGroup", instance.data.group._id, {
			logoUrl: instance.$('.-logoUrl').val(),
			backgroundUrl: instance.$('.-backgroundUrl').val(),
		}, function(err) {
			if (err) {
				addMessage(mf('group.settings.saveError', { ERROR: err }, "Error saving settings: {ERROR}"), 'danger');
			} else {
				addMessage(mf('group.settings.saved', "Saved settings"), 'success');
				instance.editingSettings.set(false);
			}
		});
	},

	'click .-cancelSettings': function(event, instance) {
		instance.editingSettings.set(false);
	},

	'click .-addMember': function(event, instance) {
		var memberId = this._id;
		var groupId = Router.current().params._id;
		Meteor.call("updateGroupMembership", memberId, groupId, true, function(err) {
			if (err) {
				addMessage(mf('group.settings.addMemberError', { ERROR: err }, "Error adding member: {ERROR}"), 'danger');
			} else {
				addMessage(mf('group.settings.addedMember', "Added group member"), 'success');
			}
		});
	},

	'click .-removeMember': function(event, instance) {
		var memberId = ''+this;
		var groupId = Router.current().params._id;
		Meteor.call("updateGroupMembership", memberId, groupId, false, function(err) {
			if (err) {
				addMessage(mf('group.settings.removeMemberError', { ERROR: err }, "Error removing member: {ERROR}"), 'danger');
			} else {
				addMessage(mf('group.settings.removedMember', "Removed group member"), 'success');
			}
		});
	},

});

Template.groupSettings.events({
	'keyup .-userSearch': function(event, instance) {
		instance.userSearch.set(instance.$('.-userSearch').val());
	}
});