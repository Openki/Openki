
UpdatesAvailable = {};
UpdatesApplied = new Meteor.Collection("UpdatesApplied");

applyUpdates = function () {
	var skipInitial = UpdatesApplied.find().count() === 0;

	for (var name in UpdatesAvailable) {
		if (UpdatesApplied.find({ name: name }).count() === 0) {
			var entry =
				{ name: name
				, affected: 0
				, run: new Date()
				};

			if (skipInitial) {
				console.log("Skipping update " + name);
			} else {
				console.log("Applying update " + name);
				entry.affected = UpdatesAvailable[name]();
				entry.applied = new Date();
				console.log(name + ": " + entry.affected + " affected documents");
			}
			UpdatesApplied.insert(entry);
		}
	}
};
