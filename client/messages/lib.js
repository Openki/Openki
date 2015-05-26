ClientMessages = new Meteor.Collection(null);

addMessage = function(message, typeParam) {
	var type = typeParam || 'info';

	var messageId = ClientMessages.insert({
		message: message,
		type: type,
	});

	if (type == 'success') {
		setTimeout(function() {
			removeMessage(messageId);
		}, 5000);
	}
}

removeMessage = function(messageId) {
	ClientMessages.remove({_id: messageId});
};
