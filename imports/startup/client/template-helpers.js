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
import { getAboutLink } from '/imports/utils/getAboutLink';
import { getFaqLink } from '/imports/utils/getFaqLink';

/**
 * Converts the input to a moment that the locale is set to timeLocale.
 *
 * Note: This is necessary because the global call moment.locale() only applies to new objects. For
 * existing moments we have to set it manually.
 * Calling Session.get('timeLocale') also makes the helper reactive.
 * @param {moment.MomentInput} date
 */
function toMomentWithTimeLocale(date) {
	return moment(date).locale(Session.get('timeLocale'));
}

const helpers = {
	siteName() {
		return getSiteName(Regions.currentRegion());
	},

	/**
	 * @param {string} name
	 */
	categoryName(name) {
		// Depend on locale and a composite mf string so we update reactively when locale changes
		// and msgfmt finish loading translations
		msgfmt.loading();
		Session.get('locale');

		return mf(`category.${name}`);
	},

	/**
	 * @param {string} type
	 */
	roleShort(type) {
		if (!type) {
			return '';
		}

		// Depend on locale and a composite mf string so we update reactively when locale changes
		// and msgfmt finish loading translations
		msgfmt.loading();
		Session.get('locale');

		return mf(`roles.${type}.short`);
	},

	/**
	 * @param {string} type
	 */
	roleIcon(type) {
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
	 * @param {string} id Region ID
	 */
	isCurrentRegion(id) {
		return id && Session.equals('region', id);
	},

	guideLink() {
		if (Meteor.settings.public.courseGuideLink) {
			return Meteor.settings.public.courseGuideLink;
		}

		const locale = Session.get('locale');

		// default fallback language
		let guideLink =
			'https://about.openki.net/wp-content/uploads/2019/05/How-to-organize-my-first-Openki-course.pdf';

		switch (locale) {
			case 'de':
				guideLink =
					'https://about.openki.net/wp-content/uploads/2019/05/Wie-organisiere-ich-ein-Openki-Treffen.pdf';
				break;
			case 'en':
				guideLink =
					'https://about.openki.net/wp-content/uploads/2019/05/How-to-organize-my-first-Openki-course.pdf';
				break;
			default:
				guideLink =
					'https://about.openki.net/wp-content/uploads/2019/05/How-to-organize-my-first-Openki-course.pdf';
				break;
		}
		return guideLink;
	},

	faqLink() {
		return getFaqLink();
	},

	aboutLink() {
		return getAboutLink();
	},

	log(context) {
		if (window.console) {
			/* eslint-disable-next-line no-console */
			console.log(arguments.length > 0 ? context : this);
		}
	},

	// Date & Time format helper
	dateShort(date) {
		if (!date) {
			return false;
		}
		return toMomentWithTimeLocale(date).format('l');
	},

	dateFormat(date) {
		if (!date) {
			return false;
		}
		return toMomentWithTimeLocale(date).format('L');
	},

	dateLong(date) {
		if (!date) {
			return false;
		}
		return toMomentWithTimeLocale(date).format('LL');
	},

	dateTimeLong(date) {
		if (!date) {
			return false;
		}
		return toMomentWithTimeLocale(date).format('LLLL');
	},

	timeFormat(date) {
		if (!date) {
			return false;
		}
		return toMomentWithTimeLocale(date).format('LT');
	},

	fromNow(date) {
		if (!date) {
			return false;
		}
		return toMomentWithTimeLocale(date).fromNow();
	},

	weekdayFormat(date) {
		if (!date) {
			return false;
		}
		return toMomentWithTimeLocale(date).format('ddd');
	},

	weekNr(date) {
		if (!date) {
			return false;
		}
		return toMomentWithTimeLocale(date).week();
	},

	calendarDayShort(date) {
		if (!date) {
			return false;
		}

		const momentForYear = toMomentWithTimeLocale(date);
		const year = momentForYear.year() !== moment().year() ? ` ${momentForYear.format('YYYY')}` : '';
		return toMomentWithTimeLocale(date).format('D. MMMM') + year;
	},

	calendarDayFormat(date) {
		if (!date) {
			return false;
		}
		return toMomentWithTimeLocale(date).format('dddd, Do MMMM');
	},

	/**
	 * Strip HTML markup
	 * @param {string} html
	 */
	plain(html) {
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
	 * @param {string} [activity] compare to this activity
	 * @returns {boolean} Whether business matches activity
	 */
	busy(activity) {
		const business = Template.instance().findBusiness();
		return business.get() === activity;
	},

	/**
	 * Disable buttons while there is business to do.
	 *
	 * Example <button {disableIfBusy}>I will be disabled when there is business.</button>
	 *
	 * @return {String} 'disabled' if the template is currently busy, empty string otherwise.
	 */
	disabledIfBusy() {
		const business = Template.instance().findBusiness();
		return business.get() ? 'disabled' : '';
	},

	state(state) {
		return Template.instance().state.get(state);
	},

	/**
	 * @param {string} groupId
	 */
	groupLogo(groupId) {
		const instance = Template.instance();
		instance.subscribe('group', groupId);

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
	/** @type {{[id: string]: string}} */
	let cache = {};
	/** @type {{[id: string]: string}} */
	let previousCache = {};
	let lookups = 0;
	/** @type {{[id: string]: Tracker.Dependency}} */
	const pending = {};

	// Update the cache if users are pushed to the collection
	Users.find().observe({
		added(user) {
			cache[user._id] = user.username;
		},
		changed(user) {
			cache[user._id] = user.username;
		},
	});

	return function (/** @type {string} */ userId) {
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
