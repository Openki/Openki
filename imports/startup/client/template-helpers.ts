import { Meteor } from 'meteor/meteor';
import { mf, msgfmt } from 'meteor/msgfmt:core';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Tracker } from 'meteor/tracker';
import moment from 'moment';

import { Groups } from '/imports/api/groups/groups';
import { Regions } from '/imports/api/regions/regions';
import { Users } from '/imports/api/users/users';
import * as usersMethods from '/imports/api/users/methods';
import { Roles } from '/imports/api/roles/roles';
import { getSiteName } from '/imports/utils/getSiteName';
import { PublicSettings } from '/imports/utils/PublicSettings';
import { getLocalisedValue } from '/imports/utils/getLocalisedValue';
import { ReactiveDict } from 'meteor/reactive-dict';

/**
 * Converts the input to a moment that the locale is set to timeLocale.
 *
 * Note: This is necessary because the global call moment.locale() only applies to new objects. For
 * existing moments we have to set it manually.
 * Calling Session.get('timeLocale') also makes the helper reactive.
 */
function toMomentWithTimeLocale(date: moment.MomentInput) {
	return moment(date).locale(Session.get('timeLocale'));
}

// eslint-disable-next-line @typescript-eslint/ban-types
const helpers: { [name: string]: Function } = {
	siteName() {
		return getSiteName(Regions.currentRegion());
	},

	categoryName(name: string) {
		// Depend on locale and a composite mf string so we update reactively when locale changes
		// and msgfmt finish loading translations
		msgfmt.loading();
		Session.get('locale');

		return mf(`category.${name}`);
	},

	roleShort(type: string) {
		if (!type) {
			return '';
		}

		// Depend on locale and a composite mf string so we update reactively when locale changes
		// and msgfmt finish loading translations
		msgfmt.loading();
		Session.get('locale');

		return mf(`roles.${type}.short`);
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

	guideLink() {
		return getLocalisedValue(PublicSettings.courseGuideLink);
	},

	faqLink() {
		return getLocalisedValue(PublicSettings.faqLink);
	},

	aboutLink() {
		return getLocalisedValue(PublicSettings.aboutLink);
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

	/**
	 * @param {string} groupId
	 */
	groupLogo(groupId: string) {
		Template.instance().subscribe('group', groupId);

		const group = Groups.findOne({ _id: groupId });

		return group?.logoUrl || '';
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
 * Get a username from ID
 */
const usernameFromId = (function () {
	// We cache the username lookups
	// To prevent unlimited cache-growth, after a enough lookups we
	// build a new cache from the old
	const cacheLimit = 1000;
	let cache: { [id: string]: string } = {};
	let previousCache: { [id: string]: string } = {};
	let lookups = 0;
	const pending: { [id: string]: Tracker.Dependency } = {};

	// Update the cache if users are pushed to the collection
	Users.find().observe({
		added(user) {
			cache[user._id] = user.username;
		},
		changed(user) {
			cache[user._id] = user.username;
		},
	});

	return function (userId: string) {
		if (!userId) {
			return mf('noUser_placeholder', 'someone');
		}

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
			cachedUser = '◌';

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
						cache[userId] = user || '?!';
						pending[userId].changed();
						delete pending[userId];
					})
					.catch((err) => {
						/* eslint-disable-next-line no-console */
						console.warn(err);
					});
			}
		}

		if (cachedUser) {
			return cachedUser;
		}
		return `userId: ${userId}`;
	};
})();

Template.registerHelper('username', usernameFromId);
