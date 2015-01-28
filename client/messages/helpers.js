Template.messages.helpers({
	messages: function() {
		return ClientMessages.find();
	}
});

Template.message.events({
	'click button.close': function() {
		removeMessage(this);
	}
});