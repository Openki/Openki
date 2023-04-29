import { i18n } from '/imports/startup/both/i18next';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { Session } from 'meteor/session';

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

	$richtext.html(instance.data.text || '');
	instance.autorun(() => {
		$richtext.html(Template.currentData().text || '');
	});

	const isRTL = Session.equals('textDirectionality', 'rtl');
	const align = !isRTL ? 'left' : 'right';

	const meOptions: MediumEditor.CoreOptions = {
		toolbar: {
			static: true,
			sticky: true,
			stickyTopOffset: 55,
			align,
			updateOnEmptySelection: true,
			// list of supported html tags / formatting. Should be same as in the saneHtml(...) function
			buttons: ['h4', 'bold', 'italic', 'underline', 'anchor', 'unorderedlist', 'orderedlist'],
		},
		disableDoubleReturn: true,
		placeholder: {
			hideOnClick: false,
			text: instance.data.placeholder || i18n('richtext.placeholder.default', 'Type your text'),
		},
		anchor: {
			linkValidation: true,
			placeholderText: i18n('richtext.link.placeholder', 'Paste or type a link'),
		},
		autoLink: true,
		buttonLabels: 'fontawesome',
	};

	// Make titles translateable
	const meExtensions = (MediumEditor as any).extensions;

	const meButton = meExtensions.button.prototype.defaults;
	meButton.h4.aria = i18n('richtext.button.h4.title', 'subheader');
	meButton.h4.contentFA = '<i class="fa fa-header">';
	meButton.bold.aria = i18n('richtext.button.bold.title', 'bold');
	meButton.italic.aria = i18n('richtext.button.italic.title', 'italic');
	meButton.underline.aria = i18n('richtext.button.underline.title', 'underline');
	meButton.unorderedlist.aria = i18n('richtext.button.unorderedlist.title', 'unordered list');
	meButton.orderedlist.aria = i18n('richtext.button.orderedlist.title', 'ordered list');

	meExtensions.anchor.prototype.aria = i18n('richtext.button.anchor.title', 'link');

	// Initialize the editor interface
	// eslint-disable-next-line no-new
	new MediumEditor($richtext[0], meOptions);

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
