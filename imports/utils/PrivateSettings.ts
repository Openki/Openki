import { check, Match } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import { StringArray, StringEnum } from './CustomChecks';

// See settings-example.json.md for full documentation

const defaults = {
	admins: [],
	prng: '',
	testdata: false,
	siteEmail: '',
	reporter: {
		sender: 'reporter@mail.openki.net',
		recipient: 'admins@openki.net',
	},
	robots: true,
	printLog: false,
	startup: { buildDbCacheAsync: false },
};

// none deep merge
const privateSettings = { ...defaults, ...Meteor.settings, ...{ public: undefined } };

// Check that everything is set as expected in the settings.
check(
	privateSettings,
	Match.ObjectIncluding({
		admins: StringArray,
		prng: StringEnum(['', 'static'] as const),
		testdata: Boolean,
		siteEmail: String,
		reporter: {
			sender: String,
			recipient: String,
		},
		robots: Boolean,
		printLog: Boolean,
		s3: {
			region: String,
			bucketEndpoint: String,
			bucketName: String,
			accessKeyId: String,
			secretAccessKey: String,
			publicUrlBase: String,
		},
		startup: { buildDbCacheAsync: Boolean },
	}),
);

/**
 * Get access to some private settings from the `Meteor.settings` enriched with default values.
 */
export const PrivateSettings = privateSettings;

export default PrivateSettings;
