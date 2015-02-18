"use strict";

Router.map(function () {
	this.route('showEvent', {
		path: 'event/:_id',
		template: 'eventPage',
		waitOn: function () {
			return [
				Meteor.subscribe('categories'),
				Meteor.subscribe('courses'),
				Meteor.subscribe('users'),
				Meteor.subscribe('events')
			]
		},
		data: function () {
			
			var event;
			var create = 'create' == this.params._id;
			if (create) {
				var date = moment().add(1, 'week').startOf('hour').toDate();
				event = { new: true, startdate: date }
			} else {
				event = Events.findOne({_id: this.params._id});
				if (!event) return {};
			}
			var course = Courses.findOne({_id: event.course_id});
		
			return {
				event: event,
				course: course
			};
		}
	})
});


Template.event.created = function() {
	this.editing = new ReactiveVar(false);
}

Template.event.rendered = function() {
	if (this.data && this.data.new) {
		this.editing.set(true);
	}
}

Template.event.helpers({
	editing: function() {
		return Template.instance().editing.get();
	}
});

Template.event.events({
	'click button.eventDelete': function () {
		if (!Meteor.userId()) {
			alert("Please log in!");
			return;
		}
		if (confirm("delete event "+"'"+this.title+"'"+"?")) {
			Events.remove(this._id);
		}
		Template.instance().editing.set(false);
	},
	
	'click button.eventEdit': function () {
		if(!Meteor.userId()) {
			alert("Please log in!");
			return;
		}
		Template.instance().editing.set(true);
	},
	
	'click button.saveEditEvent': function(event, instance) {
		// format startdate
		var dateParts =  instance.$('#edit_event_startdate').val().split(".");
		
		if (!dateParts[2]){
			alert("Date format must be dd.mm.yyyy\n(for example 20.3.2014)");
			return;
		}
		
		if(dateParts[2].toString().length==2) dateParts[2]=2000+dateParts[2]*1;

		if (instance.$('#edit_event_starttime').val()!="") {
			var timeParts = $('#edit_event_starttime').val().split(":");
		} else {
			var timeParts = [0,0];
		}
		
		var startdate = new Date(dateParts[2], (dateParts[1] - 1), dateParts[0],timeParts[0],timeParts[1])
		var now = new Date();
		
		if (startdate < now) {
			alert("Date must be in future");
			return;
		}
		
		
		var editevent = {
			title: instance.$('#edit_event_title').val(),
			description: instance.$('#edit_event_description').val(),
			location: instance.$('#edit_event_location').val(),
			startdate: startdate
		}
		
		editevent.time_lastedit = now
		
		if (this._id) {
			Events.update(this._id, { $set: editevent });
			instance.editing.set(false);
		} else {
			if (this.course_id) {
				editevent.course_id = this.course._id;
				editevent.region = this.course.region;
			} else {
				editevent.region = Session.get('region');
			}
			editevent.createdBy = Meteor.userId()
			editevent.time_created = now
			Events.insert(editevent, function(error, result) {
				if (error) {
					console.log(error);
				} else {
					Router.go('showEvent', { _id: result });
					instance.editing.set(false);
				}
			});
		}
		
	},
	
	'click button.cancelEditEvent': function () {
		Template.instance().editing.set(false);
	}
});