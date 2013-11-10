Router.configure({
	layoutTemplate: 'layout',
	notFoundTemplate: 'notFound'
//	loadingTemplate: 'loading'
});

Router.map(function () {
	this.route('home', {
		path: '/',
		template: 'start'
	})

	this.route('showCourse', {
		path: 'course/:_id',
		template: 'coursedetails',
		waitOn: function () {
			return Meteor.subscribe('categories');
		},
		data: function () {
			return Courses.findOne({_id: this.params._id})
		},
		unload: function () {
			Session.set("isEditing", false);
    	}
	})

	this.route('locations')

	this.route('categorylist')

	this.route('pages', {
		path: 'page/:page_name',
		action: function() {
			this.render(this.params.page_name)
		}
	})

	this.route('propose')

	this.route('create')


	this.route('userprofile', {
		path: 'user/:_id',
		waitOn: function () {
			return Meteor.subscribe('users');
		},
		data: function () {
			return Meteor.users.findOne({_id: this.params._id})
		}
	})

})
