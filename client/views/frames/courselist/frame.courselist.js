import Metatags from '/imports/Metatags.js';
import CssFromQuery from '/imports/ui/lib/css-from-query.js';

Router.map(function() {
	this.route('frameCourselist', {
		path: '/frame/courselist',
		template: 'frameCourselist',
		layoutTemplate: 'frameLayout'
	});
});

Template.frameCourselist.onCreated(function frameCourselistOnCreated() {
	Metatags.setCommonTags(mf('course.list.windowtitle', 'Courses'));

	this.query = Router.current().params.query
	this.increaseBy = 5;
	this.limit = new ReactiveVar(this.increaseBy);

	this.autorun(() => {
		const filter =
			Courses.Filtering()
				.read(this.query)
				.done();

		this.subscribe(
			'Courses.findFilter',
			filter.toParams(),
			this.limit.get() + 1
		);
	});

	this.subscribe('regions');
});

Template.frameCourselist.helpers({
	cssRules: () => new CssFromQuery(Template.instance().query).getCssRules(),
	ready: () => Template.instance().subscriptionsReady(),
	courses() {
		return Courses.find({}, {
			sort: { 'time_lastedit': -1 },
			limit: Template.instance().limit.get()
		});
	},
	moreCourses() {
		const limit = Template.instance().limit.get();
		const courseCount =
			Courses
				.find({}, { limit: limit + 1 })
				.count();

		return courseCount > limit;
	}
});

Template.frameCourselist.events({
	'click #showMoreCourses'(event, instance) {
		const limit = instance.limit;
		limit.set(limit.get() + instance.increaseBy);
	}
});

Template.frameCourselistCourse.onCreated(function frameCourselistCourseOnCreated() {
	this.expanded = new ReactiveVar(false);
});

Template.frameCourselistCourse.helpers({
	allRegions: () => Session.get('region') == 'all',
	regionOf: course => Regions.findOne(course.region).name,
	expanded: () => Template.instance().expanded.get()
});

Template.frameCourselistCourse.events({
	'click .js-toggle-course-details'(event, instance) {
		$(event.currentTarget).toggleClass('active');
		instance.expanded.set(!instance.expanded.get());
	}
});
