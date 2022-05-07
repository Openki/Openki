import { i18n } from '/imports/startup/both/i18next';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import MediumEditor from 'medium-editor';

import './template.html';
import './styles.scss';

const Template = TemplateAny as TemplateStaticTyped<
	'richtext',
	{ class?: string; text?: string; placeholder?: string; maxlength?: number },
	{
		numberOfCharacters: ReactiveVar<number>;
	}
>;

const template = Template.richtext;

template.onCreated(function () {
	const instance = this;

	instance.numberOfCharacters = new ReactiveVar(0);
});

template.onRendered(function () {
	const instance = this;
	const $richtext = instance.$('.js-richtext');

	const isRTL = Session.equals('textDirectionality', 'rtl');
	const align = !isRTL ? 'left' : 'right';

	const options: MediumEditor.CoreOptions = {
		toolbar: { static: true, align, updateOnEmptySelection: true },
		disableExtraSpaces: true,
		disableDoubleReturn: true,
		placeholder: {
			hideOnClick: false,
			text: instance.data.placeholder,
		},
		anchor: {
			linkValidation: true,
			placeholderText: i18n('richtext.link.placeholder', 'Paste link here…'),
		},
		autoLink: true,
		buttonLabels: 'fontawesome',
	};

	// Initialize the editor interface
	// eslint-disable-next-line no-new
	new MediumEditor($richtext[0], options);

	instance.numberOfCharacters.set($richtext.text().trim().length);

	$richtext.on('input', function () {
		// Fix placeholder position on empty after change
		if ($richtext.text().length === 0) {
			$richtext.html('');
		}

		// Get the number of visible characters
		instance.numberOfCharacters.set($richtext.text().trim().length);
	});
});

template.helpers({
	characterLimitReached() {
		const instance = Template.instance();

		if (!instance.data.maxlength) {
			return false;
		}

		return instance.numberOfCharacters.get() > instance.data.maxlength;
	},

	removeNumberOfCharacters() {
		const instance = Template.instance();

		if (!instance.data.maxlength) {
			return 0;
		}

		return instance.numberOfCharacters.get() - instance.data.maxlength;
	},
});
