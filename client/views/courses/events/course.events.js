Template.courseEvents.onCreated(function() {
	var instance = this;
	var courseId = this.data.course._id;

	instance.eventSub = subs.subscribe('eventsForCourse', courseId);

	instance.haveEvents = function() {
		return eventsFind({ course: courseId, start: minuteTime.get() }).count() > 0;
	};

	instance.ongoingEvents = function() {
		return eventsFind({ course: courseId, ongoing: minuteTime.get() });
	};

	instance.futureEvents = function() {
		return eventsFind({ course: courseId, after: minuteTime.get() }, 4);
	};
});

Template.courseEvents.helpers({
	mayAdd: function() {
		return this.course.editableBy(Meteor.user());
	},

	haveEvents: function() {
		return Template.instance().haveEvents();
	},

	ongoingEvents: function() {
		return Template.instance().ongoingEvents();
	},

	haveOngoingEvents: function() {
		return Template.instance().ongoingEvents().count() > 0;
	},

	futureEvents: function() {
		return Template.instance().futureEvents();
	},

	haveFutureEvents: function() {
		return Template.instance().futureEvents().count() > 0;
	},

	ready: function() {
		return Template.instance().eventSub.ready();
	}
});

Template.courseEvents.events({
	'click .js-add-event': function () {
		Router.go('showEvent', { _id: 'create' }, { query: { courseId: this.course._id } });
	},

	'scroll .js-scrollable-container': function(event, instance) {
		var scrollableContainer = instance.$('.js-scrollable-container');

		// Use dom element to get true height of clipped div
		// https://stackoverflow.com/questions/4612992/get-full-height-of-a-clipped-div#5627286
		var trueHeight = scrollableContainer[0].scrollHeight;
		var visibleHeight = scrollableContainer.height();

		// Compute height and subtract a possible deviation
		var computedHeight = trueHeight - visibleHeight - 1;

		instance.$(".fade-top ").fadeIn(200);

		if (scrollableContainer.scrollTop() === 0) {
			instance.$(".fade-top").fadeOut(200);
		} else if (scrollableContainer.scrollTop() >= computedHeight) {
			instance.$(".fade-bottom").fadeOut(200);
		} else {
			instance.$(".fade-top").fadeIn(200);
			instance.$(".fade-bottom").fadeIn(200);
		}
	}
});
