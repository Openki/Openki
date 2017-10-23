import { ScssVars } from '/imports/ui/lib/scss-vars.js';

Template.usersCourselist.onCreated(function() {
	var instance = this;
	var id = instance.data.profileData.user._id;

	instance.courseSub = instance.subscribe('Courses.findFilter',  { userInvolved: id });

	instance.coursesByRole = function(role) {
		return Courses.find({ members: { $elemMatch: {
			user: id,
			roles: role }
		}});
	};
});

Template.usersCourselist.helpers({
	roles: function() {
		return _.clone(Roles).reverse();
	},

	coursesByRoleCount: function(role) {
		return Template.instance().coursesByRole(role).count();
	},

	coursesByRole: function(role) {
		return Template.instance().coursesByRole(role);
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
	},
	ready: function() {
		return Template.instance().courseSub.ready();
	},
	isInvolved: function() {
		var userId = Template.instance().data.profileData.user._id;
		return Courses.findFilter({ userInvolved: userId }).count() > 0;
	}
});

Template.usersCourselist.events({
	"click .js-scroll": function(event, instance){
		var roleLabel = event.currentTarget;
		var rolePosition = $(roleLabel.getAttribute('href')).offset().top;
		// subtract the amount of pixels of the height of the navbar
		$('html, body').animate({'scrollTop': rolePosition - ScssVars.navbarHeight});
		event.preventDefault();
	}
});
