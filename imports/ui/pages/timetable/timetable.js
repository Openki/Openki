import { Template } from 'meteor/templating';

import './timetable.html';

Template.timetable.helpers({
	position: function() {
		return "left: "+this.relStart*100+"%; right: "+this.relEnd*100+"%;";
	},
	showDay: function(moment) {
		return moment.format('dddd, LL');
	},
	showHour: function(moment) {
		return moment.format('H');
	}
});
