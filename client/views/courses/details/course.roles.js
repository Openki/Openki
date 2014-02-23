

Template.roleDetails.events({
	'click input.enrol': function () {
		if(!Meteor.userId()) {
			alert("Please log in!");
			return;}
		Router.go('showCourse', this.course, { query: {enrol: this.roletype.type} })
	},

	'click input.subscribe': function () {
		if(!Meteor.userId()) {
			alert("Please log in!");
			return;}
		var comment = $('#comment').val()
		Meteor.call("change_subscription", this.course._id, this.roletype.type, true, false, comment)
		Router.go('showCourse', this.course)

	},

	'click input.subscribeAnon': function () {
		if(!Meteor.userId()) {
			alert("Please log in!");
			return;}
		var comment = $('#comment').val()
		Meteor.call("change_subscription", this.course._id, this.roletype.type, true, true, comment)
		Router.go('showCourse', this.course)
	},

	'click input.cancel': function () {
		Router.go('showCourse', this.course)
	},

	'click input.unsubscribe': function () {
		Meteor.call("change_subscription", this.course._id, this.roletype.type, false, false, undefined)
	}
})