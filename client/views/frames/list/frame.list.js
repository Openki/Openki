import Metatags from '/imports/Metatags.js';
import '/imports/ui/lib/CSSFromQuery.js';

Router.map(function () {
	this.route('frameList', {
		path: '/frame/list',
		template: 'frameList',
		layoutTemplate: 'frameLayout',
		waitOn: function () {
			var filter = Events.Filtering().read(this.params.query).done();

			this.coursesWithEvents = filter.toParams();
			this.coursesWithEvents.upcomingEvent = true;

			this.coursesWithoutEvents = filter.toParams();
			this.coursesWithoutEvents.upcomingEvent = false;

			return [
				Meteor.subscribe('Courses.findFilter', this.coursesWithEvents, 25),
				Meteor.subscribe('Courses.findFilter', this.coursesWithoutEvents, 25),
				Meteor.subscribe('group', this.coursesWithEvents.group)
			];
		},

		data: function() {
			var cssRules = new CSSFromQuery();
			cssRules
				.add('footerbg', 'background-color', '.frame-list-footer')
				.add('footercolor', 'color', '.frame-list-footer a')
				.read(this.params.query);

			var data = {
				cssRules: cssRules,
				group: Groups.findOne(this.coursesWithEvents.group),
				coursesWithEvents: Courses.findFilter(this.coursesWithEvents, 25),
				coursesWithoutEvents: Courses.findFilter(this.coursesWithoutEvents, 25)
			};
			return data;
		},

		onAfterAction: function() {
			Metatags.setCommonTags(mf('course.list.windowtitle', 'Courses'));
		}
	});
});

_.each([Template.listCourseWithEvents, Template.listCourseWithoutEvents], function(template) {
	template.onCreated(function() {
		this.expanded = new ReactiveVar(false);
	});

	template.helpers({
		'expanded': function() {
			return Template.instance().expanded.get();
		}
	});

	template.events({
		'click .js-toggle-event-details': function(e, instance) {
			$(e.currentTarget).toggleClass('active');
			instance.expanded.set(!instance.expanded.get());
		}
	});
});
