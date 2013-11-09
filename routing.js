Router.configure({
	layoutTemplate: 'layout'
});

Router.map(function () {
	this.route('home', {
		path: '/',
		template: 'start'
	})
	
	this.route('showCourse', {
		path: 'course/:_id',
		template: 'coursedetails',
		data: function () {
			return Courses.findOne({_id: this.params._id})
		}
	})
	
	this.route('categorylist')
	
	this.route('pages', {
		path: 'page/:page_id',
		action: function() {
			this.render(this.params.page_id)
		}
	})
	
	
})
