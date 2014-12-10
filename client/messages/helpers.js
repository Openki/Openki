Template.messages.helpers({
	messages: function() {
		return Messages.find();
	}
});

Template.message.events({
	'click button.close': function() {
		removeMessage(this);
	}
});