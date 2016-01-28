Router.map(function () {
	this.route('groupDetails', {
		path: 'group/:_id/:name?',
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

			return {
				group: group,
				courseQuery: {group: this._id},
				isNew: isNew,
				showCourses: !isNew,
			};
		},
		onAfterAction: function() {
			var group = Groups.findOne({_id: this.params._id});
			if (group) {
				document.title = mf('group.siteTitle', { NAME: group.name }, "{NAME}") + " - " + webpagename;
			}
		}
	});
});

Template.groupDetails.onCreated(function() {
	var data = this.data;
	var group = data.group;
	var isNew = data.isNew;

	var userId = Meteor.userId();
	var mayEdit = isNew || userId && GroupLib.isMember(userId, group._id);

	if (mayEdit) {
		var handleSaving = function(err, groupId) {
			if (err) {
				addMessage(mf('group.saving.error', { ERROR: err }, 'Saving the group went wrong! Sorry about this. We encountered the following error: {ERROR}'), 'danger');
			} else {
				addMessage(mf('group.saving.success', { NAME: group.short }), 'Saved change to {NAME}');
			}
		};

		var showControls = !isNew;

		data.editableName = makeEditable(
			group.name,
			true,
			function(newName) {
				Meteor.call("saveGroup", group._id, { name: newName }, handleSaving);
			},
			mf('group.name.placeholder', "Name for this group"),
			showControls
		);

		data.editableShort = makeEditable(
			group.short,
			true,
			function(newShort) {
				Meteor.call("saveGroup", group._id, { short: newShort }, handleSaving);
			},
			mf('group.short.placeholder', "Short name"),
			showControls
		);

		data.editableClaim = makeEditable(
			group.claim,
			true,
			function(newClaim) {
				Meteor.call("saveGroup", group._id, { short: newClaim }, handleSaving);
			},
			mf('group.claim.placeholder', "Tell us why your group is so great"),
			showControls
		);

		data.editableDescription = makeEditable(
			group.description,
			false,
			function(newDescription) {
				Meteor.call("saveGroup", group._id, { description: newDescription }, handleSaving);
			},
			mf('group.description.placeholder', "Describe the audience, the interests and activities of your group"),
			showControls
		);
	}
});

Template.groupDetails.events({
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
	}
});
