import { Match, check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import { StringEnum } from './CustomChecks';

let privateSettings;

if (Meteor.isServer) {
	// See settings-example.json.md for full documentation

	const defaults = {
		admins: [] as string[],
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
		apiMaxLimit: 100,
	};

	// none deep merge
	privateSettings = { ...defaults, ...Meteor.settings, ...{ public: undefined } };

	// Check that everything is set as expected in the settings.
	check(
		privateSettings,
		Match.ObjectIncluding({
			/** User Administrator Accounts */
			admins: [String],
			/** Pseudo-Random Number Generator */
			prng: StringEnum('', 'static'),
			/** Generates test data, is not needed for the productive system */
			testdata: Boolean,
			/** Sender e-mail address in mails */
			siteEmail: String,
			/**
			 * Sender and recipient address for "Report problem" function. The recipient is also
			 * visible in e-mail that are send to users.
			 */
			reporter: {
				sender: String,
				recipient: String,
			},
			/** Tells robots/crawlers whether to index the website or not */
			robots: Boolean,
			/** Print the log on the server in the console, usually only for development */
			printLog: Boolean,
			/** OAuth */
			service: Match.Maybe({
				facebook: Match.Maybe({
					appId: String,
					secret: String,
				}),
				github: Match.Maybe({
					clientId: String,
					secret: String,
				}),
				google: Match.Maybe({
					clientId: String,
					secret: String,
				}),
			}),
			/** Delete entries from the log or remove critical information */
			scrub: Match.Maybe([
				{
					name: String,
					comment: Match.Maybe(String),
					grace: Number,
					select: Object,
					remove: Match.Maybe(Boolean),
					unset: Match.Maybe([String]),
				},
			]),
			/** file storage */
			s3: {
				region: String,
				bucketEndpoint: String,
				bucketName: String,
				accessKeyId: String,
				secretAccessKey: String,
			},
			startup: {
				/** Build the cache in the db async or sync */
				buildDbCacheAsync: Boolean,
			},
			/** Maximum number of entities that the api returns. */
			apiMaxLimit: Number,
		}),
	);
}

/**
 * Get access to some private settings from the `Meteor.settings` enriched with default values.
 *
 * Only available on the server.
 */
export const PrivateSettings = privateSettings as NonNullable<typeof privateSettings>;
