import { i18n } from '/imports/startup/both/i18next';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import MediumEditor from 'medium-editor';

import './template.html';
import './styles.scss';

const Template = TemplateAny as TemplateStaticTyped<
	'richtext',
	{ class?: string; text?: string; placeholder?: string }
>;

const template = Template.richtext;

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

	// Fix placholder position on empty after change
	$richtext.on('input', function () {
		if ($richtext.text().length === 0) {
			$richtext.html('');
		}
	});
});
