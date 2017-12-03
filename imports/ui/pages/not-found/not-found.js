import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';

import '/imports/ui/components/report/report.js';

import './not-found.html';

Template.notFound.helpers({
	'backArrow'() {
		var isRTL = Session.get('textDirectionality') == 'rtl';
		var direction = isRTL ? 'right' : 'left';
		return Spacebars.SafeString(
			'<span class="fa fa-arrow-' + direction + ' fa-fw" aria-hidden="true"></span>'
		);
	}
});

Template.notFound.events({
	"click .js-go-back": function(event, template){
		history.back();
	}
});
