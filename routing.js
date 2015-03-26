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
	
	this.route('cal', {							///////// create /////////
		path: 'cal/',
		where: 'server',
		action: function () {
			var request = this.request;
			var response = this.response;
			
			var calendar = new iCalendar.CalendarBuilder();
			eventsFind({}).forEach(function(dbevent) {
				var event = new iCalendar.EventBuilder();
				event.setStartDate(dbevent.startdate);
				if (dbevent.enddate) event.setEndDate(dbevent.enddate);
				event.setSummary(dbevent.title);
				calendar.addEvent(event.getEvent());
			});
			
			var calendarstring = calendar.getCalendar().toString()
			this.response.writeHead(200, {
				'Content-Type': 'text/calendar'
			});
			response.write(calendarstring);
			response.end();
		}
	});
});

