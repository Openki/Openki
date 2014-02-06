"use strict";

Router.map(function () {
	this.route('showEvent', {
		path: 'event/:_id',
		template: 'course_event_detail',
		waitOn: function () {
			return Meteor.subscribe('categories');
			return Meteor.subscribe('courses');
			return Meteor.subscribe('users');
			return Meteor.subscribe('events');
		},
		data: function () {
            /*console.log("halla: "+this.params._id)
            console.log("halla: "+Events.find({}).count())
            console.log("user: "+Meteor.userId())

            var topPosts = Events.find({});
            var count = 0;
            topPosts.forEach(function (post) {
              console.log("Title of post " + count + ": " + post.title + "// id: " + post._id);
              count += 1;
            });
            */

			var event = Events.findOne({_id: this.params._id});
			// course.nameY = course.name.replace(/[^\w\s]/gi, '-').replace(/[_\s]/g, '_') //FIXME: doesn't work!
			//console.log(event)
			return {
				event: event,
				//subscribers: prepare_subscribers(course),
			};
		}
	})
})

