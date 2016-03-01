Router.configure({
	layoutTemplate: 'layout',
	notFoundTemplate: 'notFound',
	loadingTemplate: 'loadingPage',
});
Router.onBeforeAction('dataNotFound');

webpagename = 'Openki - ';                  // global (document title init)

Router.map(function () {

	this.route('categorylist',{
		onAfterAction: function() {
			document.title = webpagename + 'Category list';
		}
	});


	this.route('pages', {									///////// static /////////
		path: 'page/:page_name',
		action: function() {
			this.render(this.params.page_name);
		},
		onAfterAction: function() {
			document.title = webpagename + '' + this.params.page_name;
		}
	});

});


Router.map(function () {
	this.route('showEvent', {
		path: 'event/:_id/:slug?',
		template: 'eventPage',
		notFoundTemplate: 'eventNotFound',
		waitOn: function () {
			var subs = [
				Meteor.subscribe('event', this.params._id)
			];
			var courseId = this.params.query.courseId;
			if (courseId) {
				subs.push(Meteor.subscribe('courseDetails', courseId));
			}
			return subs;
		},
		data: function () {
			var event;
			var create = 'create' == this.params._id;
			if (create) {
				var propose = moment().add(1, 'week').startOf('hour');
				event = {
					new: true,
					start: propose.toDate(),
					end: moment(propose).add(2, 'hour').toDate(),
				};
				var course = Courses.findOne(this.params.query.courseId);
				if (course) {
					event.title = course.name;
					event.course_id = course._id;
					event.region = course.region;
					event.description = course.description;
				}
			} else {
				event = Events.findOne({_id: this.params._id});
				if (!event) return false;
			}

			return event;
		},
		onAfterAction: function() {
			var event = Events.findOne({_id: this.params._id});
			if (event) {
				document.title = webpagename + mf('event.windowtitle', {EVENT:event.title, DATE: moment(event.start).calendar()}, '{DATE} {EVENT}');
			} else {
				document.title = webpagename + mf('event.windowtitle.create', 'Create event');
			}

		}
	});
});
