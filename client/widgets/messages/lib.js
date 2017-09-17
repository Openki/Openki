ClientMessages = new Meteor.Collection(null);

addMessage = (message, typeParam) => {
	const type = typeParam || 'info';
	const messageId = ClientMessages.insert({ message, type	});

	if (type == 'success') {
		setTimeout(() => removeMessage(messageId), 5000);
	}
};

removeMessage = (messageId) => ClientMessages.remove({ _id: messageId });
