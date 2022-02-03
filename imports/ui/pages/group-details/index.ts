import { Router } from 'meteor/iron:router';
import { Meteor } from 'meteor/meteor';
import { i18n } from '/imports/startup/both/i18next';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import { GroupModel, Groups } from '/imports/api/groups/groups';
import * as GroupsMethods from '/imports/api/groups/methods';
import { Regions } from '/imports/api/regions/regions';
import * as Alert from '/imports/api/alerts/alert';

import { PleaseLogin } from '/imports/ui/lib/please-login';
import * as TemplateMixins from '/imports/ui/lib/template-mixins';
import { Store, Editable } from '/imports/ui/lib/editable';
import { SaveAfterLogin } from '/imports/ui/lib/save-after-login';
import { Analytics } from '/imports/ui/lib/analytics';

import '/imports/ui/components/buttons';
import '/imports/ui/components/editable/editable';
import '/imports/ui/components/groups/settings';

import './template.html';
import './styles.scss';

const TemplateBase = TemplateAny as TemplateStaticTyped<
	'groupDetailsPage',
	{
		courseQuery: any;
		group: GroupModel;
		showCourses: boolean;
	},
	{
		mayEdit: ReactiveVar<boolean>;
		editingSettings: ReactiveVar<boolean>;
		editableName: Editable;
		editableShort: Editable;
		editableClaim: Editable;
		editableDescription: Editable;
	}
>;

const Template = TemplateMixins.FormfieldErrors(TemplateBase, 'groupDetailsPage', {
	emptyField: {
		text: () => i18n('group.details.error.allMandatory', 'All four fields are mandatory.'),
		field: 'all',
	},
});

const template = Template.groupDetailsPage;

template.onCreated(function () {
	const instance = this;

	instance.busy(false);

	const { group } = instance.data;
	const groupId = group._id;
	instance.mayEdit = new ReactiveVar(false);
	instance.editingSettings = new ReactiveVar(false);

	const handleSaving: Store = {
		clientValidations: [
			{
				check: (text) => !!text,
				errorMessage: () => i18n('group.details.error.allMandatory'),
			},
		],
		onSuccess: () => {
			Alert.success(
				i18n('groupDetails.changesSaved', 'Changes to the "{GROUP}" group have been saved.', {
					GROUP: group?.name,
				}),
			);
		},
		onError: (err) => {
			Alert.serverError(
				err,
				i18n('groupDetails.saveError', 'Could not save the "{GROUP}" group', {
					GROUP: group?.name,
				}),
			);
		},
	};

	const showControls = !this.data.group.isNew();

	instance.editableName = new Editable(
		true,
		i18n('group.name.placeholder', 'Name of your group, institution, community or program'),
		showControls
			? {
					...handleSaving,
					onSave: async (newName) => {
						await GroupsMethods.save(groupId, { name: newName });
					},
			  }
			: undefined,
	);

	instance.editableShort = new Editable(
		true,
		i18n('group.short.placeholder', 'Abbreviation'),
		showControls
			? {
					...handleSaving,
					onSave: async (newShort) => {
						await GroupsMethods.save(groupId, { short: newShort });
					},
			  }
			: undefined,
	);

	instance.editableClaim = new Editable(
		true,
		i18n('group.claim.placeholder', 'The core idea'),
		showControls
			? {
					...handleSaving,
					onSave: async (newClaim) => {
						await GroupsMethods.save(groupId, { claim: newClaim });
					},
			  }
			: undefined,
	);

	instance.editableDescription = new Editable(
		false,
		i18n(
			'group.description.placeholder',
			'Describe the audience, the interests and activities of your group.',
		),
		showControls
			? {
					...handleSaving,
					onSave: async (newDescription) => {
						await GroupsMethods.save(groupId, { description: newDescription });
					},
			  }
			: undefined,
	);

	instance.autorun(() => {
		const data = Template.currentData();
		const currentGroup = Groups.findOne(groupId) || ({} as Partial<GroupModel>);
		const user = Meteor.user();
		const mayEdit = data.group.editableBy(user);
		instance.mayEdit.set(mayEdit);

		instance.editableName.setText(currentGroup.name || '');
		instance.editableShort.setText(currentGroup.short || '');
		instance.editableClaim.setText(currentGroup.claim || '');
		instance.editableDescription.setText(currentGroup.description || '');
	});
});

template.helpers({
	isFeatured() {
		const region = Regions.currentRegion();
		return region && region.featuredGroup === Template.instance().data.group._id;
	},

	headerClasses() {
		const classes = [];
		if (Template.instance().data.group.logoUrl) {
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
		const { group } = Template.currentData();
		if (group.isNew()) {
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
		const { group } = Template.currentData();
		return instance.mayEdit.get() && !group.isNew() && instance.editingSettings.get();
	},
});

template.events({
	'click .js-group-settings'(_event, instance) {
		if (PleaseLogin()) {
			return false;
		}
		instance.editingSettings.set(!instance.editingSettings.get());
		return true;
	},

	'click .js-group-save'(_event, instance) {
		const group = {
			name: instance.editableName.getEdited(),
			short: instance.editableShort.getEdited(),
			claim: instance.editableClaim.getEdited(),
			description: instance.editableDescription.getEdited(),
		};

		instance.errors.reset();

		if (Object.values(group).some((u) => !u)) {
			instance.errors.add('emptyField');
		}

		if (instance.errors.present()) {
			return;
		}

		instance.busy('saving');
		SaveAfterLogin(
			instance,
			i18n('loginAction.saveGroup', 'Log in and save group'),
			i18n('registerAction.saveGroup', 'Register and save group'),
			async () => {
				try {
					const groupId = await GroupsMethods.save('', group);

					instance.editableName.end();
					instance.editableShort.end();
					instance.editableClaim.end();
					instance.editableDescription.end();

					Alert.success(
						i18n('groupDetails.groupCreated', 'The "{GROUP}" group was created.', {
							GROUP: group.name,
						}),
					);

					Analytics.trackEvent('Group creations', 'Group creations');

					Router.go('groupDetails', { _id: groupId });
				} catch (err) {
					Alert.serverError(err, i18n('groupDetails.saveError', { GROUP: group.name }));
				} finally {
					instance.busy(false);
				}
			},
		);
	},

	'click .js-group-cancel'() {
		Router.go('/'); // Got a better idea?
	},

	'click .js-group-remove-filter'() {
		Router.go('/'); // Got a better idea?
	},
});
