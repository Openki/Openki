import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { _ } from 'meteor/underscore';

import { LanguageEntity, Languages } from '/imports/api/languages/languages';

import { PublicSettings } from '/imports/utils/PublicSettings';
import { getLocalisedValue } from '/imports/utils/getLocalisedValue';
import * as StringTools from '/imports/utils/string-tools';

import './template.html';
import './styles.scss';

{
	const Template = TemplateAny as TemplateStaticTyped<
		'languageSelectionWrap',
		Record<string, unknown>,
		{
			searchingLanguages: ReactiveVar<false>;
		}
	>;

	const template = Template.languageSelectionWrap;

	template.onCreated(function () {
		const instance = this;
		instance.searchingLanguages = new ReactiveVar(false);
	});

	template.helpers({
		searchingLanguages() {
			return Template.instance().searchingLanguages.get();
		},
	});
}

{
	const Template = TemplateAny as TemplateStaticTyped<'languageDisplay'>;

	const template = Template.languageDisplay;

	template.helpers({
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

	template.events({
		'click .js-language-display'(_event, instance) {
			(instance.parentInstance() as any).searchingLanguages.set(true);
		},
	});
}
{
	const Template = TemplateAny as TemplateStaticTyped<
		'languageSelection',
		Record<string, unknown>,
		{
			searchHasFocus: boolean;
			languageSearch: ReactiveVar<string>;
			close: () => void;
		}
	>;

	const template = Template.languageSelection;

	template.onCreated(function () {
		this.languageSearch = new ReactiveVar('');

		// create a function to toggle displaying the regionSelection
		// only if it is placed inside a wrap
		this.close = () => {
			const searchingLanguages = (this.parentInstance() as any).searchingLanguages;
			if (searchingLanguages.get()) {
				searchingLanguages.set(false);
			}
		};
	});

	template.onRendered(function () {
		const instance = this;

		instance.$('.js-language-search').trigger('select');

		instance.$('.dropdown').on('hide.bs.dropdown', () => {
			(instance.parentInstance() as any).searchingLanguages.set(false);
		});
	});

	template.helpers({
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
			const results: LanguageEntity[] = [];

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

		languageNameMarked(this: LanguageEntity) {
			const search = Template.instance().languageSearch.get();
			const { name } = this;
			return StringTools.markedName(search, name);
		},

		currentLanguage(this: LanguageEntity) {
			return this === Languages[Session.get('locale')];
		},

		helpLink() {
			return getLocalisedValue(PublicSettings.i18nHelpLink);
		},
	});

	const updateLanguageSearch = _.debounce((instance: ReturnType<typeof Template['instance']>) => {
		let search = instance.$('.js-language-search').val();
		search = String(search).trim();
		if (!(instance.languageSearch.get() === search)) {
			instance.languageSearch.set(search);
			instance.$('.dropdown-toggle').dropdown('show');
		}
	}, 100);

	template.events({
		'click .js-language-link'(this: LanguageEntity, event, instance) {
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

			(instance.parentInstance() as any).searchingLanguages.set(false);
		},
		'keyup .js-language-search'(_event, instance) {
			// eslint-disable-next-line no-param-reassign
			instance.searchHasFocus = true;
			updateLanguageSearch(instance);
		},

		'submit .js-language-selection-form'(event, instance) {
			event.preventDefault();
			instance.$('.js-language-link').first().trigger('click');
		},

		'focus .js-language-search'(_event, instance) {
			instance.$('.dropdown-toggle').dropdown('show');
		},

		'focusin/focusout .js-language-search'(event, instance) {
			// eslint-disable-next-line no-param-reassign
			instance.searchHasFocus = event.type === 'focusin';
		},

		'show.bs.dropdown'(_event, instance) {
			if (!instance.searchHasFocus) {
				Meteor.defer(() => {
					instance.$('.js-language-search').trigger('select');
				});
			}
		},

		'hide.bs.dropdown'(_event, instance) {
			if (!instance.searchHasFocus) {
				instance.close();
				return true;
			}

			return false;
		},
	});
}
