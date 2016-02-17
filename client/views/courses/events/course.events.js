Template.course_events.helpers({
	mayAdd: function() {
		return hasRoleUser(this.course.members, 'team', Meteor.userId());
	},

	haveEvents: function() {
		return Template.instance().haveEvents();
	},

	pastEvents:  function() {
		var events = Template.instance().pastEvents().fetch();
		events.reverse(); // eventsFind() is too smart for us

		// HACK Add a balancing element if the count is uneven because the past events should stack up from the bottom
		if (events.length % 2 == 1) events.unshift(false);

		return events;
	},

	havePastEvents: function() {
		return Template.instance().pastEvents().count() > 0;
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
});


Template.course_events.onCreated(function() {
	var instance = this;
	var courseId = this.data.course._id;

	instance.autorun(function() {
		subs.subscribe('eventsForCourse', courseId);
	});

	instance.haveEvents = function() {
		return eventsFind({ course: courseId }).count() > 0;
	};

	instance.pastEvents = function() {
		return eventsFind({ course: courseId, before: minuteTime.get() });
	};

	instance.ongoingEvents = function() {
		return eventsFind({ course: courseId, ongoing: minuteTime.get() });
	};

	instance.futureEvents = function() {
		return eventsFind({ course: courseId, after: minuteTime.get() });
	};
});


Template.course_events.rendered = function() {
	var scrollableContainer = this.$(".course_events");

	if (scrollableContainer.length === 0) return; // No events

	scrollableContainer.scroll(function (event) {
		var trueHeight = scrollableContainer[0].scrollHeight - scrollableContainer.height();
		var reactiveArea = trueHeight - 1;

		$(".fade_effect_top").fadeIn(200);
		$(".fade_effect_bottom").fadeIn(200);

		if (scrollableContainer.scrollTop() > reactiveArea) {
			$(".fade_effect_bottom").fadeOut(200);
		}
		else if (scrollableContainer.scrollTop() < 1) {
			$(".fade_effect_top").fadeOut(200);
		}
	});
	scrollableContainer.scrollTop(this.$("hr.now").offset().top-scrollableContainer.offset().top); //halp
};

Template.course.rendered = function() {
	this.$("[data-toggle='tooltip']").tooltip();
};

Template.course_events.events({
	'click button.eventEdit': function () {
		Router.go('showEvent', { _id: 'create' }, { query: { courseId: this.course._id } });
	}
});
