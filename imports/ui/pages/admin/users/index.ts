import { ReactiveVar } from 'meteor/reactive-var';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import { userSearchPrefix } from '/imports/utils/user-search-prefix';

import '/imports/ui/components/buttons';

import './template.html';

const Template = TemplateAny as TemplateStaticTyped<
	'adminUsersPage',
	Record<string, unknown>,
	{ userSearch: ReactiveVar<string> }
>;

const template = Template.adminUsersPage;

template.onCreated(function () {
	const instance = this;

	instance.busy(false);

	instance.userSearch = new ReactiveVar('');

	instance.autorun(() => {
		const search = instance.userSearch.get();
		if (search.length > 0) {
			instance.subscribe('userSearch', search);
		}
	});
});

template.helpers({
	foundUsers() {
		const instance = Template.instance();

		const search = instance.userSearch.get();
		if (search === '') {
			return false;
		}

		return userSearchPrefix(search, { limit: 30 });
	},
});

template.events({
	'keyup .js-search-users'(_event, instance) {
		instance.userSearch.set(instance.$('.js-search-users').val() as string);
	},
});
