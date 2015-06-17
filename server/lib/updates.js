
UpdatesAvailable = {};
UpdatesApplied = new Meteor.Collection("UpdatesApplied");

applyUpdates = function () {
	for (name in UpdatesAvailable) {
		if (UpdatesApplied.find({ name: name }).count() == 0) {
			console.log("Applying update " + name);
			UpdatesAvailable[name]();
			UpdatesApplied.insert({ name: name, applied: new Date() });
		}
	}
};