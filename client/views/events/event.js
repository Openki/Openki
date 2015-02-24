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
		var startDateParts =  instance.$('#edit_event_startdate').val().split(".");
		if (!startDateParts[2]){
			alert("Date format must be dd.mm.yyyy\n(for example 20.3.2014)");
			return;
		}
		if(startDateParts[2].toString().length==2) startDateParts[2]=2000+startDateParts[2]*1;
		if (instance.$('#edit_event_starttime').val()!="") {
			var startTimeParts = $('#edit_event_starttime').val().split(":");
		} else {
			var startTimeParts = [0,0];
		}
		var startdate = new Date(startDateParts[2], (startDateParts[1] - 1), startDateParts[0],startTimeParts[0],startTimeParts[1])
		var now = new Date();
		if (startdate < now) {
			alert("Date must be in future");
			return;
		}
		


		var duration = instance.$('#edit_event_duration').val()
		if (duration){
			var enddate = startdate  //TODO: help here!
			enddate.setMinutes(startdate.getMinutes()+duration);	
		} else {	
			// format enddate
			var endDateParts =  instance.$('#edit_event_startdate').val().split(".");
			if (!endDateParts[2]){
				alert("Date format must be dd.mm.yyyy\n(for example 20.3.2014)");
				return;
			}
			if(endDateParts[2].toString().length==2) endDateParts[2]=2000+endDateParts[2]*1;
			if (instance.$('#edit_event_endtime').val()!="") {
				var endTimeParts = $('#edit_event_endtime').val().split(":");
			} else {
				var endTimeParts = [0,0];
			}
			var enddate = new Date(endDateParts[2], (endDateParts[1] - 1), endDateParts[0],endTimeParts[0],endTimeParts[1])
			var now = new Date();
			if (enddate < startdate) {
				alert("end must be after start");
				return;
			}
		}

		var editevent = {
			title: instance.$('#edit_event_title').val(),
			description: instance.$('#edit_event_description').val(),
			location: instance.$('#edit_event_location').val(),
			room: instance.$('#edit_event_room').val(),
			startdate: startdate,
			enddate: enddate
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
	},

	'click #toggle_duration': function(event){
		$('#show_time_end').toggle(300);
		$('#show_duration').toggle(300);
	},

});