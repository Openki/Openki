import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';

import '/imports/ui/components/report/report';

import './not-found.html';

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
	'click .js-go-back'() {
		window.history.back();
	},
});
