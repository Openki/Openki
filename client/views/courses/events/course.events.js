Template.courseEvents.onCreated(function() {
	var instance = this;
	var courseId = this.data.course._id;

	subs.subscribe('eventsForCourse', courseId);

	instance.haveEvents = function() {
		return eventsFind({ course: courseId, start: minuteTime.get() }).count() > 0;
	};

	instance.ongoingEvents = function() {
		return eventsFind({ course: courseId, ongoing: minuteTime.get() });
	};

	instance.futureEvents = function() {
		return eventsFind({ course: courseId, after: minuteTime.get() }, 4);
	};

	instance.hasScrolled = new ReactiveVar(false);
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
	}
});

Template.courseEvents.events({
	'click .js-add-event': function () {
		Router.go('showEvent', { _id: 'create' }, { query: { courseId: this.course._id } });
	},

	'scroll .js-scrollable-container': function() {
		var instance = Template.instance();
		var scrollableContainer = instance.$('.js-scrollable-container');

		if (!instance.hasScrolled.get()) {
			instance.$(".fade-top").fadeIn(200);
			instance.hasScrolled.set(true);
		}

		// Use dom element to get true height of clipped div
		// https://stackoverflow.com/questions/4612992/get-full-height-of-a-clipped-div#5627286
		var trueHeight = scrollableContainer[0].scrollHeight;
		var visibleHeight = scrollableContainer.height();

		// Compute height and subtract a possible deviation
		var computedHeight = trueHeight - visibleHeight - 0.2;

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
