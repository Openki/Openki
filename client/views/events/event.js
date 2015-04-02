"use strict";

Router.map(function () {
	this.route('showEvent', {
		path: 'event/:_id',
		template: 'eventPage',
		waitOn: function () {
			return [
				Meteor.subscribe('categories'),
				Meteor.subscribe('event', this.params._id)
			]
		},
		data: function () {
			
			var event;
			var create = 'create' == this.params._id;
			if (create) {
				var propose = moment().add(1, 'week').startOf('hour');
				event = {
					new: true,
					startdate: propose.toDate(),
					enddate: moment(propose).add(2, 'hour').toDate()
				};
			} else {
				event = Events.findOne({_id: this.params._id});
				if (!event) return {};
			}

			return event;
		}
	})
});


Template.event.created = function() {
	this.editing = new ReactiveVar(false);
}

Template.eventPage.helpers({
	course: function() {
		var courseId = this.course_id;
		if (courseId) {
			// Very bad?
			Template.instance().subscribe('courseDetails', courseId);
			
			return Courses.findOne({_id: courseId});
		}
	}
});

Template.event.helpers({
	editing: function() {
		return this.new || Template.instance().editing.get();
	}
});

Template.eventDescritpionEdit.rendered = function() {
	new MediumEditor(this.firstNode);
}

Template.event.events({
	'click button.eventDelete': function () {
		if (pleaseLogin()) return;
		if (confirm("delete event "+"'"+this.title+"'"+"?")) {
			Meteor.call('removeEvent', this._id)
		}
		Template.instance().editing.set(false);
	},
	
	'click button.eventEdit': function () {
		if (pleaseLogin()) return;
		Template.instance().editing.set(true);
	},
	
	'click button.saveEditEvent': function(event, instance) {
		if (pleaseLogin()) return;

		function readTime(str, date) {
			/* Given str, set minute and hour of date
			 * given "08:00", "0800", "8.00", or "8" time is set to 8 hours 0 minutes
			 * given "08:30" "0830" "8.30" time is set to 8 hours 30 minutes
			 * given "08:30pm" "0830PM" "830p" time is set to 20 hours 30 minutes
			 * given "12:59AM" "12:59PM" time is set to 12 hours 59 minutes
			 * given "" or "my hovercraft is full of eels" time is not changed
			 * given "my 5 hovercraft are full of peels" time is set to 17 hours 0 minutes
			 * The behavior for values over 23 (hours) and 59 (minutes) is left as a surprise to the user.
			 */
			var digits = str.replace(/[^0-9]+/g, '');
			if (digits.length > 0) {
				if (digits.length < 3) {
					date.setMinutes(0);
					date.setHours(parseInt(digits, 10));
				} else {
					date.setMinutes(parseInt(digits.substr(-2), 10));
					date.setHours(parseInt(digits.substr(0, digits.length-2), 10));
				}
				if (str.toLowerCase().indexOf('p') != -1) {
					var hours = date.getHours();
					if (hours < 12) { // not correct for midn SHUT UP
						date.setHours(hours + 12);  // YOU'RE IN THE ARMY NOW
					}
				}
			}
		}

		// format startdate
		var startDateParts =  instance.$('#edit_event_startdate').val().split(".");
		if (!startDateParts[2]){
			alert("Date format must be dd.mm.yyyy\n(for example 20.3.2014)");
			return;
		}
		var startdate = new Date(startDateParts[2], (startDateParts[1] - 1), startDateParts[0]);

		var startStr = instance.$('#edit_event_starttime').val();
		readTime(startStr, startdate);


		var now = new Date();
		if (startdate < now) {
			alert("Date must be in future");
			return;
		}

		var enddate = new Date(startdate.getTime()); // Rough approximation

		if (duration){
			var duration = instance.$('#edit_event_duration').val();
			enddate.setMinutes(enddate.getMinutes()+duration);	
		} else {
			var endStr = instance.$('#edit_event_endtime').val()
			readTime(endStr, enddate);

			if (enddate < startdate) {
				enddate = startdate // No questions asked
			}
		}

		var editevent = {
			title: instance.$('#edit_event_title').val(),
			description: instance.$('#edit_event_description').html(),
			location: instance.$('#edit_event_location').val(),
			room: instance.$('#edit_event_room').val(),
			startdate: startdate,
			enddate: enddate
		}
		
		var eventId = this._id;
		var isNew = !this._id;
		if (isNew) {
			eventId = '';
			
			if (this.course_id) {
				editevent.course_id = this.course._id;
				editevent.region = this.course.region;
			} else {
				editevent.region = Session.get('region');
			}
		}
		
		Meteor.call('saveEvent',  eventId, editevent, function(error, eventId) {
			if (error) {
				console.log(error);
			} else {
				if (isNew) Router.go('showEvent', { _id: eventId });
				instance.editing.set(false);
			}
		});
	},
	
	'click button.cancelEditEvent': function () {
		if (this.new) history.back();
		Template.instance().editing.set(false);
	},

	'click #toggle_duration': function(event){
		$('#show_time_end').toggle(300);
		$('#show_duration').toggle(300);
	},

});
