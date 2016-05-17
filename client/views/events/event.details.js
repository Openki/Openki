// routing is in /routing.js

Template.event.onCreated(function() {
	this.editing = new ReactiveVar(!this.data._id);
});


Template.eventDisplay.onCreated(function() {
	this.locationTracker = LocationTracker();
	this.replicating = new ReactiveVar(false);
});


Template.eventDisplay.onRendered(function() {
	this.locationTracker.setRegion(this.data.region);
	this.locationTracker.setLocation(this.data.location);
	this.$("[data-toggle='tooltip']").tooltip();
	$('a[href!="*"].nav_link').removeClass('active');
});


Template.eventPage.helpers({
	course: function() {
		var courseId = this.courseId;
		if (courseId) {
			// Very bad?
			Template.instance().subscribe('courseDetails', courseId);

			return Courses.findOne({_id: courseId});
		}
	},
});


Template.event.helpers({
	editing: function() {
		return this.new || Template.instance().editing.get();
	},
});


Template.eventDisplay.helpers({
	mayEdit: function() {
		return mayEditEvent(Meteor.user(), this);
	},
	eventMarkers: function() {
		return Template.instance().locationTracker.markers;
	},
	haveLocation: function() {
		return this.location && this.location.loc;
	},

	replicating: function() {
		return Template.instance().replicating.get();
	}
});

Template.event.events({
	'click button.eventDelete': function () {
		if (pleaseLogin()) return;
		if (confirm('Delete event "'+this.title+'"?')) {
			var title = this.title;
			var course = this.courseId;
			Meteor.call('removeEvent', this._id, function (error, eventRemoved){
				if (eventRemoved) {
					addMessage(mf('event.removed', { TITLE: title }, 'Successfully removed event "{TITLE}".'), 'success');
					if (course) {
						Router.go('showCourse', { _id: course });
					} else {
						Router.go('/');
					}
				} else {
					addMessage(mf('event.remove.error', { TITLE: title }, 'Error during removal of event "{TITLE}".'), 'danger');
				}
			});
			Template.instance().editing.set(false);
		}
	},

	'click button.eventEdit': function (event, instance) {
		if (pleaseLogin()) return;
		instance.editing.set(true);
	},
});

Template.eventDisplay.events({
	'click .-openReplication': function(event, instance) {
		instance.replicating.set(true);
	},

	'click .-closeReplication': function(event, instance) {
		instance.replicating.set(false);
	},
});
