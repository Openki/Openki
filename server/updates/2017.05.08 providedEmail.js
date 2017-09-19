UpdatesAvailable["2017.05.08 providedEmail"] = function() {
	var count = 0;
	Meteor.users.find({ 'emails.0': null }).forEach(function(user) {
		// Read email-address if provided
		var providedEmail = false;
		var verified = true; // Assume verified unless there is a flag that says it's not
		let services = user.services;
		if (services) {
			for (let provider of ['facebook', 'google', 'github']) {
				let provided = services[provider];
				if (provided && provided.email) {
					providedEmail = provided.email;
					if (typeof provided.verified_email === "boolean") {
						verified = provided.verified_email;
					}
				}
			}
		}

		if (providedEmail) {
			try {
				count += Meteor.users.update(
					user._id,
					{ $set: { emails: [{ address: providedEmail, verified: verified }] } }
				);
			} catch(e) {
				console.log(e);
			}
		}
	});

	return count;
};
