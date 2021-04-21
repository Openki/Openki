import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';

const clientId = Random.id();

/**
 * @param {{name: string; message: string;}} error
 */
const reportToServer = function (error) {
	const report = {
		name: error.name,
		message: error.message,
		location: window.location.href,
		tsClient: new Date(),
		clientId,
		userAgent: window.navigator.userAgent,
	};
	Meteor.call('log.clientError', report);
};

window.addEventListener('error', (event) => {
	reportToServer(event.error);
});

/** @type string[] */
const buffer = [];
const discriminatoryReporting = function (/** @type {[msg: string, error?: Error ]} */ args) {
	const msg = args[0];

	// "Exception from Tracker recompute function:"
	if (msg.startsWith('Exception from Tracker')) {
		// Boring, followed by "Error: ..."
		return;
	}

	// "Error: No such function: ..."
	if (msg.startsWith('Error:')) {
		buffer.push(msg);
		return;
	}

	// "Blaze.View.prototy..."
	if (msg.startsWith('Blaze.')) {
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
Meteor._debug = function (/** @type {[msg: string, error: Error ]} */ ...args) {
	meteorDebug.apply(this, args);
	discriminatoryReporting(args);
};
