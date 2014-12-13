ClientMessages = new Meteor.Collection(null);

addMessage = function(message) {
  ClientMessages.insert({message: message})
}

removeMessage = function(message) {
  ClientMessages.remove({_id: message._id})
}