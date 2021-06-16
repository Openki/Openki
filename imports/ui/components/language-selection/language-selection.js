import { $ } from 'meteor/jquery';
import { mfPkg } from 'meteor/msgfmt:core';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';

import * as Alert from '/imports/api/alerts/alert';
import { Languages } from '/imports/api/languages/languages';

import { ScssVars } from '/imports/ui/lib/scss-vars';
import * as StringTools from '/imports/utils/string-tools';

import './language-selection.html';

Template.languageSelectionWrap.created = function () {
	const instance = this;
	instance.searchingLanguages = new ReactiveVar(false);
	this.subscribe('mfStats');
};

Template.languageSelectionWrap.helpers({
	searchingLanguages() {
		return Template.instance().searchingLanguages.get();
	},
});

Template.languageDisplay.helpers({
	inNavbarClasses() {
		if (this.inNavbar) {
			return 'col-6-sm-auto';
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
});

Template.languageSelection.helpers({
	inNavbarClasses() {
		if (this.inNavbar) {
			return 'navbar-form navbar-form-selection col-6-sm-auto';
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

	translated() {
		const getTransPercent = () => {
			const mfStats = mfPkg.mfMeta.findOne({ _id: '__stats' });
			if (mfStats) {
				const langStats = mfStats.langs.find((stats) => stats.lang === this.lg);
				return langStats.transPercent;
			}
			return false;
		};

		const percent = this.lg === mfPkg.native ? 100 : getTransPercent();
		const rating = percent >= 75 && 'well-translated';

		return { percent, rating };
	},

	currentLanguage() {
		return this === Languages[Session.get('locale')];
	},
});

const updateLanguageSearch = _.debounce((instance) => {
	let search = instance.$('.js-language-search').val();
	search = String(search).trim();
	instance.languageSearch.set(search);
}, 100);

Template.languageSelection.events({
	'click .js-language-link'(event, instance) {
		event.preventDefault();
		const { lg } = this;

		try {
			localStorage.setItem('locale', lg);
		} catch (e) {
			Alert.error(e);
		}
		// The db user update happens in the client/start.js in Tracker.autorun(() => { ... by
		// messageformat
		Session.set('locale', lg);

		instance.parentInstance().searchingLanguages.set(false);
	},

	'keyup .js-language-search'(event, instance) {
		if (event.which === 13) {
			instance.$('.js-language-link').first().click();
		} else {
			updateLanguageSearch(instance);
		}
	},

	'focus .js-language-search'(event, instance) {
		const viewportWidth = Session.get('viewportWidth');
		const isRetina = Session.equals('isRetina', true);
		const screenMD = viewportWidth >= ScssVars.screenSM && viewportWidth <= ScssVars.screenMD;

		if (screenMD && !isRetina) {
			$('.navbar-collapse > .nav:first-child > li:not(.navbar-link-active)').fadeTo('slow', 0);
			$('.navbar-collapse > .nav:first-child > li:not(.navbar-link-active)').hide();
		}

		instance.$('.dropdown-toggle').dropdown('toggle');
	},
});

Template.languageSelection.onRendered(function () {
	const instance = this;

	instance.$('.js-language-search').select();

	instance
		.parentInstance()
		.$('.dropdown')
		.on('hide.bs.dropdown', () => {
			const viewportWidth = Session.get('viewportWidth');
			const isRetina = Session.get('isRetina');
			const screenMD = viewportWidth >= ScssVars.screenSM && viewportWidth <= ScssVars.screenMD;

			if (screenMD && !isRetina) {
				$('.navbar-collapse > .nav:first-child > li:not(.navbar-link-active)').show();
				$('.navbar-collapse > .nav:first-child > li:not(.navbar-link-active)').fadeTo('slow', 1);
			}

			instance.parentInstance().searchingLanguages.set(false);
		});
});
