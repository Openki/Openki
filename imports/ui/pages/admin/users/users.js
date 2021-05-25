import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';

import { userSearchPrefix } from '/imports/utils/user-search-prefix';

import '/imports/ui/components/buttons/buttons';

import './users.html';

Template.users.onCreated(function () {
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

Template.users.helpers({
	foundUsers() {
		const instance = Template.instance();

		const search = instance.userSearch.get();
		if (search === '') {
			return false;
		}

		return userSearchPrefix(search, { limit: 30 });
	},
});

Template.users.events({
	'keyup .js-search-users'(event, instance) {
		instance.userSearch.set(instance.$('.js-search-users').val());
	},
});
