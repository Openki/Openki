Template.messages.helpers({
	hasMessages: function() {
		return ClientMessages.find().count();
	},

	messages: function() {
		return ClientMessages.find();
	}
});

Template.message.events({
	'click button.close': function() {
		removeMessage(this._id);
	}
});
