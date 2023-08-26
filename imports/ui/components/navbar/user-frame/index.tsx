import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import $ from 'jquery';

import './template.html';

const Template = TemplateAny as TemplateStaticTyped<'userFrame'>;

const template = Template.userFrame;

template.events({
	'click .js-logout'(event) {
		event.preventDefault();
		Meteor.logout();

		const routeName = Router.current().route?.getName();
		if (routeName === 'profile') {
			Router.go('userprofile', Meteor.user() ?? undefined);
		}
	},

	'click .btn'() {
		$('.collapse').collapse('hide');
	},
});

