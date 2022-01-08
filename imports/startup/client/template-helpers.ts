import { i18n } from '/imports/startup/both/i18next';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Tracker } from 'meteor/tracker';
import { Spacebars } from 'meteor/spacebars';
import { Blaze } from 'meteor/blaze';
import moment from 'moment';

import { Regions } from '/imports/api/regions/regions';
import { Users } from '/imports/api/users/users';
import * as usersMethods from '/imports/api/users/methods';
import { Roles } from '/imports/api/roles/roles';
import { getSiteName } from '/imports/utils/getSiteName';
import { PublicSettings } from '/imports/utils/PublicSettings';
import { getLocalizedValue } from '/imports/utils/getLocalizedValue';
import { ReactiveDict } from 'meteor/reactive-dict';
import { UserEntity } from '/imports/api/fixtures/ensureFixture';
import { checkContribution } from '/imports/utils/checkContribution';

/**
 * Converts the input to a moment that the locale is set to timeLocale.
 *
 * Note: This is necessary because the global call moment.locale() only applies to new objects. For
 * existing moments we have to set it manually.
 * Calling Session.get('timeLocale') also makes the helper reactive.
 */
function toMomentWithTimeLocale(date: moment.MomentInput) {
	return moment(date).locale(Session.get('timeLocale') || 'en');
}

// eslint-disable-next-line @typescript-eslint/ban-types
const helpers: { [name: string]: Function } = {
	siteName() {
		return getSiteName(Regions.currentRegion());
	},

	categoryName(name: string) {
		return i18n(`category.${name}`);
	},

	roleShort(type: string) {
		if (!type) {
			return '';
		}
		return i18n(`roles.${type}.short`);
	},

	roleIcon(type: string) {
		if (!type) {
			return '';
		}

		return Roles.find((r) => r.type === type)?.icon || '';
	},

	regions() {
		return Regions.find();
	},

	currentRegionName() {
		return Regions.currentRegion()?.name || '';
	},

	/**
	 * @param id Region ID
	 */
	isCurrentRegion(id: string) {
		return id && Session.equals('region', id);
	},

	PublicSettings() {
		return PublicSettings;
	},

	localized(value: string | Record<string, unknown> | null | undefined) {
		return getLocalizedValue(value);
	},

	log(context: any) {
		if (window.console) {
			/* eslint-disable-next-line no-console */
			console.log(arguments.length > 0 ? context : this);
		}
	},

	// Date & Time format helper
	dateShort(date: moment.MomentInput) {
		if (!date) {
			return false;
		}
		return toMomentWithTimeLocale(date).format('l');
	},

	dateFormat(date: moment.MomentInput) {
		if (!date) {
			return false;
		}
		return toMomentWithTimeLocale(date).format('L');
	},

	dateLong(date: moment.MomentInput) {
		if (!date) {
			return false;
		}
		return toMomentWithTimeLocale(date).format('LL');
	},

	dateTimeLong(date: moment.MomentInput) {
		if (!date) {
			return false;
		}
		return toMomentWithTimeLocale(date).format('LLLL');
	},

	timeFormat(date: moment.MomentInput) {
		if (!date) {
			return false;
		}
		return toMomentWithTimeLocale(date).format('LT');
	},

	fromNow(date: moment.MomentInput) {
		if (!date) {
			return false;
		}
		return toMomentWithTimeLocale(date).fromNow();
	},

	weekdayFormat(date: moment.MomentInput) {
		if (!date) {
			return false;
		}
		return toMomentWithTimeLocale(date).format('ddd');
	},

	weekNr(date: moment.MomentInput) {
		if (!date) {
			return false;
		}
		return toMomentWithTimeLocale(date).week();
	},

	calendarDayShort(date: moment.MomentInput) {
		if (!date) {
			return false;
		}

		const momentForYear = toMomentWithTimeLocale(date);
		const year = momentForYear.year() !== moment().year() ? ` ${momentForYear.format('YYYY')}` : '';
		return toMomentWithTimeLocale(date).format('D. MMMM') + year;
	},

	calendarDayFormat(date: moment.MomentInput) {
		if (!date) {
			return false;
		}
		return toMomentWithTimeLocale(date).format('dddd, Do MMMM');
	},

	/**
	 * Strip HTML markup
	 */
	plain(html: string) {
		// Prevent words from sticking together
		// eg. <p>Kloradf dadeq gsd.</p><p>Loradf dadeq gsd.</p> => Kloradf dadeq gsd. Loradf dadeq gsd.
		const htmlPreparedForMinimalStyling = html
			.replace(/<br \/>/g, '<br /> ')
			.replace(/<p>/g, '<p> ')
			.replace(/<\/p>/g, '</p> ')
			.replace(/<h2>/g, '<h2> ')
			.replace(/<\/h2>/g, '</h2> ')
			.replace(/<h3>/g, '<h3> ')
			.replace(/<\/h3>/g, '</h3> ');
		// Source: https://stackoverflow.com/questions/822452/strip-html-from-text-javascript/47140708#47140708
		const doc = new DOMParser().parseFromString(htmlPreparedForMinimalStyling, 'text/html');
		return doc.body.textContent || '';
	},

	/**
	 * Compare activity to template business
	 * This can be used to show a busy state while the template is working.
	 *
	 * Example: <button>{#if busy 'saving'}Saving...{else}Save now!{/if}</button>
	 *
	 * @param activity compare to this activity
	 * @returns Whether business matches activity
	 */
	busy(activity?: string | boolean) {
		const business = Template.instance().findBusiness();
		return business.get() === activity;
	},

	/**
	 * Disable buttons while there is business to do.
	 *
	 * Example <button {disableIfBusy}>I will be disabled when there is business.</button>
	 *
	 * @return 'disabled' if the template is currently busy, empty string otherwise.
	 */
	disabledIfBusy() {
		const business = Template.instance().findBusiness();
		return business.get() ? 'disabled' : '';
	},

	state(key: string) {
		const state = (Template.instance() as any).state as ReactiveDict | undefined;

		if (!(state instanceof ReactiveDict)) {
			throw new Error('state is not a ReactiveDict');
		}

		return state.get(key);
	},

	stateEquals(key: string, value: any) {
		const state = (Template.instance() as any).state as ReactiveDict | undefined;

		if (!(state instanceof ReactiveDict)) {
			throw new Error('state is not a ReactiveDict');
		}

		return state.equals(key, value);
	},

	/**
	 * This can be used to directly access instance methods without declaring
	 * helpers.
	 * @returns The instance for use in the template
	 */
	instance() {
		return Template.instance();
	},
};

Object.keys(helpers).forEach((name) => Template.registerHelper(name, helpers[name]));

/**
 * Register username and contribution helper. Cache the user data.
 */
{
	// We cache the username lookups
	// To prevent unlimited cache-growth, after a enough lookups we
	// build a new cache from the old
	const cacheLimit = 1000;
	let cache: { [id: string]: Pick<UserEntity, 'username' | 'contribution'> } = {};
	let previousCache: typeof cache = {};
	let lookups = 0;
	const pending: { [id: string]: Tracker.Dependency } = {};

	// Update the cache if users are pushed to the collection
	Users.find({}, { fields: { _id: 1, username: 1, contribution: 1 } }).observe({
		added(user) {
			cache[user._id] = user;
		},
		changed(user) {
			cache[user._id] = user;
		},
	});

	const getCachedUser = (userId: string) => {
		// Consult cache
		let cachedUser = cache[userId];
		if (cachedUser === undefined) {
			// Consult old cache
			cachedUser = previousCache[userId];

			// Carry to new cache if it was present in the old
			if (cachedUser !== undefined) {
				cache[userId] = cachedUser;
			}
		}

		if (cachedUser === undefined) {
			// Substitute until the name (or its absence) is loaded
			cachedUser = { username: '◌' };

			if (pending[userId]) {
				pending[userId].depend();
			} else {
				// Cache miss, now we'll have to round-trip to the server
				lookups += 1;
				pending[userId] = new Tracker.Dependency();
				pending[userId].depend();

				// Cycle the cache if it's full
				if (cacheLimit < lookups) {
					previousCache = cache;
					cache = {};
					lookups = 0;
				}

				usersMethods
					.name(userId)
					.then((user) => {
						cache[userId] = user || { username: '?!' };
						pending[userId].changed();
						delete pending[userId];
					})
					.catch((err) => {
						/* eslint-disable-next-line no-console */
						console.warn(err);
					});
			}
		}

		return cachedUser;
	};

	Template.registerHelper('username', function (userId: string) {
		if (!userId) {
			return i18n('noUser_placeholder', 'someone');
		}

		const cachedUser = getCachedUser(userId);

		if (!cachedUser) {
			return `userId: ${userId}`;
		}

		return cachedUser.username;
	});

	Template.registerHelper('contribution', function (userId: string) {
		if (!userId) {
			return '';
		}

		const contribution = PublicSettings.contribution;

		if (!contribution) {
			return '';
		}

		const cachedUser = getCachedUser(userId);

		if (!cachedUser) {
			return '';
		}

		if (!checkContribution(cachedUser.contribution)) {
			return '';
		}

		return Spacebars.SafeString(
			`<a href="${getLocalizedValue(contribution.link)}" data-tooltip="${Blaze._escape(
				i18n(
					'user.hasContributed',
					'{USERNAME} supported {SITENAME} with a donation. Click on the {ICON} for more information how to contribute.',
					{
						USERNAME: cachedUser.username,
						SITENAME: getSiteName(Regions.currentRegion()),
						ICON: Spacebars.SafeString(`<i class="${contribution.icon}" aria-hidden="true"></i>`),
					},
				),
			)}"><sup><i class="${contribution.icon}" aria-hidden="true"></i></sup></a>`,
		);
	});
}
