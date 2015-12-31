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

			var userId = Meteor.userId();
			var mayEdit = isNew || userId && GroupLib.isMember(userId, group._id);
			var data = {
				group: group,
				courseQuery: {group: this._id},
				showCourses: !isNew
			};

			if (mayEdit) {
				var handleSaving = function(err, groupId) {
					if (err) {
						addMessage(mf('group.saving.error', { ERROR: err }, 'Saving the group went wrong! Sorry about this. We encountered the following error: {ERROR}'), 'danger');
					} else {
						addMessage(mf('group.saving.success', { NAME: group.short }), 'Saved change to {NAME}');
						if (isNew) Router.go('groupDetails', { _id: groupId });
					}
				};

				data.editableName = makeEditable(
					group.name,
					true,
					function(newName) {
						Meteor.call("saveGroup", group._id, { name: newName }, handleSaving);
					},
					mf('group.name.placeholder', "Name for this group")
				);
				data.editableDescription = makeEditable(
					group.description,
					false,
					function(newDescription) {
						Meteor.call("saveGroup", group._id, { description: newDescription }, handleSaving);
					},
					mf('group.description.placeholder', "Tell us why this group is so good")
				);
			}
			return data;
		},
		onAfterAction: function() {
			var group = Groups.findOne({_id: this.params._id});
			if (group) {
				document.title = mf('group.siteTitle', { NAME: group.name }, "{NAME}") + " - " + webpagename;
			}
		}
	});
});
