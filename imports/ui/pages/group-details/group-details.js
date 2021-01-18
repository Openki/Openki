

import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Template } from 'meteor/templating';

import Groups from '/imports/api/groups/groups';
import PleaseLogin from '/imports/ui/lib/please-login';
import Editable from '/imports/ui/lib/editable';
import SaveAfterLogin from '/imports/ui/lib/save-after-login';
import Alert from '/imports/api/alerts/alert';
import IsGroupMember from '/imports/utils/is-group-member';

import '/imports/ui/components/buttons/buttons';
import '/imports/ui/components/editable/editable';
import '/imports/ui/components/groups/settings/group-settings';

import './group-details.html';

Template.groupDetails.onCreated(function () {
	const instance = this;

	instance.busy(false);

	const { group } = instance.data;
	const groupId = group._id;
	instance.mayEdit = new ReactiveVar(false);
	instance.editingSettings = new ReactiveVar(false);

	const handleSaving = function (err) {
		if (err) {
			Alert.serverError(
				err,
				mf(
					'groupDetails.saveError',
					{ GROUP: group.name },
					'Saving the group "{GROUP}" went wrong',
				),
			);
		} else {
			Alert.success(mf(
				'groupDetails.changesSaved',
				{ GROUP: group.name },
				'Your changes to the group "{GROUP}" have been saved.',
			));
		}
	};

	const showControls = !this.data.isNew;

	instance.editableName = new Editable(
		true,
		(newName) => {
			Meteor.call('group.save', groupId, { name: newName }, handleSaving);
		},
		mf('group.name.placeholder', 'Name of your group, institution, community or program'),
		showControls,
	);

	instance.editableShort = new Editable(
		true,
		(newShort) => {
			Meteor.call('group.save', groupId, { short: newShort }, handleSaving);
		},
		mf('group.short.placeholder', 'Abbreviation'),
		showControls,
	);

	instance.editableClaim = new Editable(
		true,
		(newClaim) => {
			Meteor.call('group.save', groupId, { claim: newClaim }, handleSaving);
		},
		mf('group.claim.placeholder', 'The core idea'),
		showControls,
	);

	instance.editableDescription = new Editable(
		false,
		(newDescription) => {
			Meteor.call('group.save', groupId, { description: newDescription }, handleSaving);
		},
		mf('group.description.placeholder', 'Describe the audience, the interests and activities of your group.'),
		showControls,
	);


	instance.autorun(() => {
		const data = Template.currentData();
		const currentGroup = Groups.findOne(groupId) || {};
		const userId = Meteor.userId();
		const mayEdit = data.isNew || (userId && IsGroupMember(userId, groupId));
		instance.mayEdit.set(mayEdit);

		instance.editableName.setText(currentGroup.name);
		instance.editableShort.setText(currentGroup.short);
		instance.editableClaim.setText(currentGroup.claim);
		instance.editableDescription.setText(currentGroup.description);
	});
});

Template.groupDetails.helpers({
	isFeatured() {
		const region = Regions.currentRegion();
		return region?.featuredGroup === this.group._id;
	},

	headerClasses() {
		const classes = [];
		if (this.group.logo) {
			classes.push('has-logo');
		}
		if (Template.instance().mayEdit.get()) {
			classes.push('is-editable');
		}
		return classes.join(' ');
	},
	editableName() {
		const instance = Template.instance();
		return instance.mayEdit.get() && instance.editableName;
	},
	editableShort() {
		const instance = Template.instance();
		return instance.mayEdit.get() && instance.editableShort;
	},
	hasContent() {
		const { group } = this;
		const { isNew } = this;
		if (isNew) {
			return true;
		}
		return group.claim || group.description;
	},
	editableClaim() {
		const instance = Template.instance();
		return instance.mayEdit.get() && instance.editableClaim;
	},
	editableDescription() {
		const instance = Template.instance();
		return instance.mayEdit.get() && instance.editableDescription;
	},
	mayEdit() {
		const instance = Template.instance();
		return instance.mayEdit.get();
	},
	editingSettings() {
		const instance = Template.instance();
		return instance.mayEdit.get() && instance.editingSettings.get();
	},
});

Template.groupDetails.events({
	'click .js-group-settings'(event, instance) {
		if (PleaseLogin()) {
			return false;
		}
		instance.editingSettings.set(!instance.editingSettings.get());
		return true;
	},

	'click .js-group-save'(event, instance) {
		const group = {
			name: instance.editableName.getEdited(),
			short: instance.editableShort.getEdited(),
			claim: instance.editableClaim.getEdited(),
			description: instance.editableDescription.getEdited(),
		};

		instance.busy('saving');
		SaveAfterLogin(instance,
			mf('loginAction.saveGroup', 'Login and save group'),
			mf('registerAction.saveGroup', 'Register and save group'),
			() => {
				Meteor.call('group.save', 'create', group, (err, groupId) => {
					instance.busy(false);
					if (err) {
						Alert.serverError(
							err,
							mf(
								'groupDetails.saveError',
								{ GROUP: group.name },
							),
						);
					} else {
						instance.editableName.end();
						instance.editableShort.end();
						instance.editableClaim.end();
						instance.editableDescription.end();

						Alert.success(mf(
							'groupDetails.groupCreated',
							{ GROUP: group.name },
							'The Group {GROUP} has been created!',
						));
						Router.go('groupDetails', { _id: groupId });
					}
				});
			});
	},

	'click .js-group-cancel'() {
		Router.go('/'); // Got a better idea?
	},

	'click .js-group-remove-filter'() {
		Router.go('/'); // Got a better idea?
	},
});
