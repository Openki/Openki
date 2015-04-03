Router.configure({
	layoutTemplate: 'layout',
	notFoundTemplate: 'notFound',
	loadingTemplate: 'loading',
});

webpagename = 'Openki - Course Organisation Platform - '  // global (document title init)

Router.map(function () {
	this.route('locationDetails',{							///////// locationdetails /////////
		path: 'locations/:_id',
		template: 'location_details',
		waitOn: function () {
			return Meteor.subscribe('locations');
		},
		data: function () {
			return Locations.findOne({_id: this.params._id})
		},
		onAfterAction: function() {
			var location = Locations.findOne({_id: this.params._id})
			if (!location) return; // wtf
			document.title = webpagename + 'Location: ' + location.name
		}
	})


	this.route('categorylist',{								///////// categories /////////
		waitOn: function () {
			return Meteor.subscribe('categories');     // TODO: Anchor tags don't work anyway
		},
		onAfterAction: function() {
			document.title = webpagename + 'Category list'
		}
	})


	this.route('pages', {									///////// static /////////
		path: 'page/:page_name',
		action: function() {
			this.render(this.params.page_name)
		},
		onAfterAction: function() {
			document.title = webpagename + '' + this.params.page_name
		}
	})

	this.route('proposeCourse', {							///////// propose /////////
		path: 'courses/propose',
		template: 'proposecourse',
		waitOn: function () {
			return Meteor.subscribe('categories');
		},
		onAfterAction: function() {
			document.title = webpagename + 'Propose new course'
		}
	})

	this.route('createCourse', {							///////// create /////////
		path: 'courses/create',
		template: 'createcourse',
		waitOn: function () {
			return Meteor.subscribe('categories');
		},
		onAfterAction: function() {
			document.title = webpagename + 'Create new course'
		}
	})

	this.route('admin', {								///////// admin /////////
		template: 'admin'
	});

});


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

