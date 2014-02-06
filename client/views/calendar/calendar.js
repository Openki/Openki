Template.calendar.calendar_eventlist = function() {
	//Meteor.subscribe('events'); // should not be here
	var today = new Date();
 return Events.find({startdate: {$gt:today}},{sort: {startdate: 1}});
};


Template.calendar.calendar_eventlist_past = function() {
	//Meteor.subscribe('events'); // should not be here
	var today = new Date();
 return Events.find({startdate: {$lt:today}},{sort: {startdate: -1}});
};
