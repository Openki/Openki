import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';

import { Languages } from '/imports/api/languages/languages';

import { PublicSettings } from '/imports/utils/PublicSettings';
import { getLocalisedValue } from '/imports/utils/getLocalisedValue';
import * as StringTools from '/imports/utils/string-tools';

import './language-selection.html';

Template.languageSelectionWrap.created = function () {
	const instance = this;
	instance.searchingLanguages = new ReactiveVar(false);
};

Template.languageSelectionWrap.helpers({
	searchingLanguages() {
		return Template.instance().searchingLanguages.get();
	},
});

Template.languageDisplay.helpers({
	inNavbarClasses() {
		if (this.inNavbar) {
			return 'col-6-sm-auto px-0';
		}
		return '';
	},
	setLanguage() {
		return Languages[Session.get('locale')];
	},
});

Template.languageDisplay.events({
	'click .js-language-display'(event, instance) {
		instance.parentInstance().searchingLanguages.set(true);
	},
});

Template.languageSelection.onCreated(function () {
	this.languageSearch = new ReactiveVar('');

	// create a function to toggle displaying the regionSelection
	// only if it is placed inside a wrap
	this.close = () => {
		const searchingLanguages = this.parentInstance().searchingLanguages;
		if (searchingLanguages.get()) {
			searchingLanguages.set(false);
		}
	};
});

Template.languageSelection.helpers({
	inNavbarClasses() {
		if (this.inNavbar) {
			return 'col-6-sm-auto px-0';
		}
		return '';
	},

	setLanguage() {
		return Languages[Session.get('locale')];
	},

	languages() {
		const visibleLanguages = Object.values(Languages).filter((lg) => lg.visible);
		const search = Template.instance().languageSearch.get().toLowerCase();
		const results = [];

		visibleLanguages.forEach((visibleLanguage) => {
			let pushed = false;
			[visibleLanguage.name, visibleLanguage.english].every((property) => {
				if (pushed) {
					return false;
				}
				if (property.toLowerCase().includes(search)) {
					results.push(visibleLanguage);
					pushed = true;
				}
				return true;
			});
		});
		return results;
	},

	languageNameMarked() {
		const search = Template.instance().languageSearch.get();
		const { name } = this;
		return StringTools.markedName(search, name);
	},

	currentLanguage() {
		return this === Languages[Session.get('locale')];
	},

	helpLink() {
		return getLocalisedValue(PublicSettings.i18nHelpLink);
	},
});

const updateLanguageSearch = _.debounce((instance) => {
	let search = instance.$('.js-language-search').val();
	search = String(search).trim();
	if (!(instance.languageSearch.get() === search)) {
		instance.languageSearch.set(search);
		instance.$('.dropdown-toggle').dropdown('show');
	}
}, 100);

Template.languageSelection.events({
	'click .js-language-link'(event, instance) {
		event.preventDefault();

		// eslint-disable-next-line no-param-reassign
		instance.searchHasFocus = false;
		instance.$('.js-region-search').trigger('focusout');
		instance.$('.dropdown-toggle').dropdown('hide');

		const { lg } = this;

		try {
			localStorage.setItem('locale', lg);
		} catch {
			// ignore See: https://developer.mozilla.org/en-US/docs/Web/API/Storage/setItem#exceptions
		}
		// The db user update happens in the client/main.js in Tracker.autorun(() => { ...
		Session.set('locale', lg);

		instance.parentInstance().searchingLanguages.set(false);
	},
	'keyup .js-language-search'(event, instance) {
		// eslint-disable-next-line no-param-reassign
		instance.searchHasFocus = true;
		updateLanguageSearch(instance);
	},

	'submit .js-language-selection-form'(event, instance) {
		event.preventDefault();
		instance.$('.js-language-link').first().trigger('click');
	},

	'focus .js-language-search'(event, instance) {
		instance.$('.dropdown-toggle').dropdown('show');
	},

	'focusin/focusout .js-language-search'(event, instance) {
		// eslint-disable-next-line no-param-reassign
		instance.searchHasFocus = event.type === 'focusin';
	},

	'show.bs.dropdown'(event, instance) {
		if (!instance.searchHasFocus) {
			Meteor.defer(() => {
				instance.$('.js-language-search').trigger('select');
			});
		}
	},

	'hide.bs.dropdown'(event, instance) {
		if (!instance.searchHasFocus) {
			instance.close();
			return true;
		}

		return false;
	},
});

Template.languageSelection.onRendered(function () {
	const instance = this;

	instance.$('.js-language-search').trigger('select');

	instance.$('.dropdown').on('hide.bs.dropdown', () => {
		instance.parentInstance().searchingLanguages.set(false);
	});
});
