import { Meteor } from 'meteor/meteor';
import { i18n } from '/imports/startup/both/i18next';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import { Users } from '/imports/api/users/users';
import * as usersMethods from '/imports/api/users/methods';
import * as Alert from '/imports/api/alerts/alert';

import './template.html';
import './styles.scss';

{
	const Template = TemplateAny as TemplateStaticTyped<
		'avatar',
		{ color?: number; userId?: string; class?: string }
	>;

	const template = Template.avatar;

	template.onCreated(function () {
		const data = this.data;

		if (data.color !== undefined) {
			return;
		}

		if (data.userId !== undefined) {
			this.subscribe('user', data.userId);
		}
	});

	template.helpers({
		color() {
			const data = Template.currentData();

			// the form sets the color directly
			if (data.color !== undefined) {
				return data.color;
			}

			// otherwise get the color from a user
			const user = Users.findOne(data.userId || Meteor.userId() || undefined);
			const color = user?.avatar?.color;

			if (color === undefined) {
				return 0;
			}

			return color;
		},

		class() {
			return Template.currentData().class || '';
		},
	});
}
{
	const Template = TemplateAny as TemplateStaticTyped<
		'avatarForm',
		unknown,
		{ tempColor: ReactiveVar<number> }
	>;

	const template = Template.avatarForm;

	template.onCreated(function () {
		this.tempColor = new ReactiveVar(Meteor.user()?.avatar?.color || 0);
	});

	template.onRendered(() => {
		$('#avatarColorRange').val(Template.instance().tempColor.get());
	});

	template.helpers({
		color() {
			return Template.instance().tempColor.get();
		},
	});

	template.events({
		'input .js-change-avatar-color'(event, instance) {
			instance.tempColor.set(parseInt((event.target as HTMLInputElement).value, 10));
		},

		async 'change .js-change-avatar-color'(_event, instance) {
			const newColor = Number(instance.tempColor.get());

			// only update the color if it has changed
			if (Meteor.user()?.avatar?.color === newColor) {
				return;
			}

			await usersMethods.updateAvatarColor(newColor);

			Alert.success(i18n('profile.updated', 'Updated profile'));
		},
	});
}
