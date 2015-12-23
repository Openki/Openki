Router.map(function() {
	this.route('groupPage', {
		path: 'group/:_id/:name?',
		waitOn: function() {
			return [
				Meteor.subscribe('group', this.params._id),
			];
		},

		data: function() {
			return Groups.findOne(this.params._id);
		},

		onAfterAction: function() {
			if (!this.data()) return;
			document.title = webpagename + '' + this.data().short + "-details";
		}
	})
})

Template.groupPage.helpers({
	groupQuery: function() {
		return {group: this._id};
	}
});