const clientId = Random.id();

const reportToServer = function (error) {
	const report = {
		name: error.name,
		message: error.message,
		location: window.location.href,
		tsClient: new Date(),
		clientId,
		userAgent: window.navigator.userAgent,
	};
	Meteor.call('log.clientError', report, () => {
	});
};

window.addEventListener('error', event => {
	reportToServer(event.error);
});

const buffer = [];
const discriminatoryReporting = function (args) {
	const msg = args[0];

	// "Exception from Tracker recompute function:"
	if (msg.indexOf('Exception from Tracker') === 0) {
		// Boring, followed by "Error: ..."
		return;
	}

	// "Error: No such function: ..."
	if (msg.indexOf('Error:') === 0) {
		buffer.push(msg);
		return;
	}

	// "Blaze.View.prototy..."
	if (msg.indexOf('Blaze.') === 0) {
		// There's a template name in there right?
		const templateNames = /Template\.[^_]\w+/g;
		buffer.push(msg.match(templateNames).join(','));
		reportToServer(
			{
				name: 'TemplateError',
				message: buffer.join('; '),
			},
		);
		return;
	}

	// Sometimes an error is passed as second argument
	if (args[1] instanceof Error) {
		reportToServer(args[1]);
		return;
	}

	// Log all the things!
	reportToServer({ name: 'Meteor._debug', message: args[0] });
};

// wrap the Meteor debug function
const meteorDebug = Meteor._debug;
Meteor._debug = function (/* arguments */) {
	/* eslint-disable-next-line prefer-rest-params */
	meteorDebug.apply(this, arguments);
	/* eslint-disable-next-line prefer-rest-params */
	discriminatoryReporting(arguments);
};
