Router.map(function() {
	this.route('groupPage', {
		path: 'group/:_id/:name?',
		waitOn: function () {
			return [
				Meteor.subscribe('user', this.params._id),
				Meteor.subscribe('groupsFind', { own: true }),
				Meteor.subscribe('coursesFind', { userInvolved: this.params._id })
			];
		},
		data: function () {
			var user = Meteor.users.findOne({_id: this.params._id});
			if (!user) return; // not loaded?

			return {
				'user': user,
				'inviteGroups': groupsFind({ own: true }),
			};
		},
		onAfterAction: function() {
			var user = Meteor.users.findOne({_id: this.params._id})
			if (!user) return; // wtf
			document.title = webpagename + '' + group.short + "-details"
		}
	})
}) 
 