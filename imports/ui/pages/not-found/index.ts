import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { Spacebars } from 'meteor/spacebars';

import '/imports/ui/components/report/report';

import './template.html';

Template.notFound.helpers({
	backArrow() {
		const isRTL = Session.equals('textDirectionality', 'rtl');
		const direction = isRTL ? 'right' : 'left';
		return Spacebars.SafeString(
			`<span class="fa fa-arrow-${direction} fa-fw" aria-hidden="true"></span>`,
		);
	},
});

Template.notFound.events({
	'click .js-open-login'() {
		$('.js-account-tasks').modal('show');
	},
	'click .js-go-back'() {
		window.history.back();
	},
});
