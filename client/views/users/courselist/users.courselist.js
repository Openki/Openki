Template.usersCourselist.onCreated(function() {
	var instance = this;

	instance.autorun(function() {
		var id = instance.data.profileData.user._id;
		Meteor.subscribe('coursesFind',  { userInvolved: id });
	});
});

Template.usersCourselist.helpers({
	roles: function() {
		return _.clone(Roles).reverse();
	},

	coursesByRoleCount: function(role) {
		return Courses.find({ members: { $elemMatch: {
			user: Template.instance().data.profileData.user._id,
			roles: role }
		}}).count();
	},

	coursesByRole: function(role) {
		return Courses.find({ members: { $elemMatch: {
			user: Template.instance().data.profileData.user._id,
			roles: role }
		}});
	},

	roleUserList: function() {
		return 'roles.' + this.type + '.userList';
	},

	roleMyList: function() {
		return 'roles.' + this.type + '.myList';
	},

	getName: function() {
		var username = Template.instance()
		               .data.profileData
		               .user.username;
		if (username) return username;
	},
	roleShort: function() {
		return 'roles.' + this.type + '.short';
	}
});

Template.usersCourselist.events({
	'click #js-scroll-team': function() {
		var position = $('#team').offset();
		if(typeof position != 'undefined') {
			// subtract the amount of pixels of the height of the navbar
			position = position.top - 50;
			$(document.body).animate({'scrollTop': position}, 400);
		}
	},
	'click #js-scroll-host': function() {
		var position = $('#host').offset();
		if(typeof position != 'undefined') {
			// subtract the amount of pixels of the height of the navbar
			position = position.top - 50;
			$(document.body).animate({'scrollTop': position}, 400);
		}
	},
	'click #js-scroll-mentor': function() {
		var position = $('#mentor').offset();
		if(typeof position != 'undefined') {
			// subtract the amount of pixels of the height of the navbar
			position = position.top - 50;
			$(document.body).animate({'scrollTop': position}, 400);
		}
	},
	'click #js-scroll-participant': function() {
		var position = $('#participant').offset();
		if(typeof position != 'undefined') {
			// subtract the amount of pixels of the height of the navbar
			position = position.top - 50;
			$(document.body).animate({'scrollTop': position}, 400);
		}
	},
});