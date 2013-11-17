Router.configure({
	layoutTemplate: 'layout',
	notFoundTemplate: 'notFound',
	loadingTemplate: 'loading',
});

webpagename = 'Hmmm - Course Organisation Platform - '  // global (document title init)


Router.map(function () {									///////// startpage /////////

	this.route('home', {
		path: '/',
		template: 'start',
		after: function() {
			document.title = webpagename + 'Home'
		}
	})

	this.route('locationDetails',{							///////// locationdetails /////////
		path: 'locations/:_id',
		template: 'locationdetails',
		waitOn: function () {
			return Meteor.subscribe('locations');
		},
		data: function () {
			return Locations.findOne({_id: this.params._id})
		},
		after: function() {
			var location = Locations.findOne({_id: this.params._id})
			if (!location) return; // wtf
			document.title = webpagename + 'Location: ' + location.name
		}
	})


	this.route('locations',{								///////// locationlist /////////
		path: 'locations',
		template: 'locationlist',
		waitOn: function () {
			return Meteor.subscribe('locations');
		},
		after: function() {
			document.title = webpagename + 'Location list'
		}
	})

	this.route('categorylist',{								///////// categories /////////
		after: function() {
			document.title = webpagename + 'Category-list'
		}
	})


	this.route('pages', {									///////// static /////////
		path: 'page/:page_name',
		action: function() {
			this.render(this.params.page_name)
		},
		after: function() {
			document.title = webpagename + '' + this.params.page_name
		}
	})

	this.route('proposeCourse', {							///////// propose /////////
		path: 'courses/propose',
		template: 'proposecourse',
		waitOn: function () {
			return Meteor.subscribe('categories');
		},
		after: function() {
			document.title = webpagename + 'Propose new course'
		}
	})

	this.route('createCourse', {							///////// create /////////
		path: 'courses/create',
		template: 'createcourse',
		waitOn: function () {
			return Meteor.subscribe('categories');
		},
		after: function() {
			document.title = webpagename + 'Create new course'
		}
	})

	this.route('userprofile', {								///////// userprofile /////////
		path: 'user/:_id/:username?',
		waitOn: function () {
			return Meteor.subscribe('users');
		},
		data: function () {
			return Meteor.users.findOne({_id: this.params._id})
		},
		after: function() {
			var user = Meteor.users.findOne({_id: this.params._id})
			if (!user) return; // wtf
			document.title = webpagename + '' + user.username + "'s Profile"
		}
	})
		this.route('calendar')

})

