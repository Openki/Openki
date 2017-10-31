import { Template } from 'meteor/templating';

import '/imports/ui/components/report/report.js';

import './not-found.html';

Template.notFound.events({
	"click .js-go-back": function(event, template){
		history.back();
	}
});
