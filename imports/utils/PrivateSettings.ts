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
	};

	// none deep merge
	privateSettings = { ...defaults, ...Meteor.settings, ...{ public: undefined } };

	// Check that everything is set as expected in the settings.
	check(
		privateSettings,
		Match.ObjectIncluding({
			admins: [String],
			prng: StringEnum(['', 'static'] as const),
			testdata: Boolean,
			siteEmail: String,
			reporter: {
				sender: String,
				recipient: String,
			},
			robots: Boolean,
			printLog: Boolean,
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
			s3: {
				region: String,
				bucketEndpoint: String,
				bucketName: String,
				accessKeyId: String,
				secretAccessKey: String,
			},
			startup: { buildDbCacheAsync: Boolean },
		}),
	);
}

/**
 * Get access to some private settings from the `Meteor.settings` enriched with default values.
 *
 * Only available on the server.
 */
export const PrivateSettings = privateSettings as NonNullable<typeof privateSettings>;

export default PrivateSettings;
