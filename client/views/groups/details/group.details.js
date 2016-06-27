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
});

Template.groupDetails.helpers({
	editingSettings: function() {
		return this.mayEdit && Template.instance().editingSettings.get();
	},
});

Template.groupDetails.events({
	'click .-settings' : function(event, instance) {
		if (pleaseLogin()) return false;
		instance.editingSettings.set(!instance.editingSettings.get());
	},

	'click .js-group-save': function(event, instance) {
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

	'click .js-group-cancel': function(event, instance) {
		Router.go('/'); // Got a better idea?
	}
});
