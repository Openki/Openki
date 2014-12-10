Messages = new Meteor.Collection(null);

addMessage = function(message) {
  Messages.insert({message: message})
}

removeMessage = function(message) {
  Messages.remove({_id: message._id})
}