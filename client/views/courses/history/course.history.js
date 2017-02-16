Template.coursehistory.helpers({
	pastEventsList: function() {
		var today= new Date();
		return Events.find({ courseId: this.course._id, start: {$lt:today} }, { sort: {start: -1} } );
	},
});
