
UpdatesAvailable = {};
UpdatesApplied = new Meteor.Collection("UpdatesApplied");

applyUpdates = function () {
	for (name in UpdatesAvailable) {
		if (UpdatesApplied.find({ name: name }).count() == 0) {
			console.log("Applying update " + name);
			var affected = UpdatesAvailable[name]();
			console.log(''+affected+" affected documents");
			UpdatesApplied.insert({ name: name, applied: new Date(), affected: affected });
		}
	}
};
