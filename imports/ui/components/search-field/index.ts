import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { _ } from 'meteor/underscore';

import '/imports/ui/components/courses/list/course-list';
import '/imports/ui/components/courses/edit';
import '/imports/ui/components/courses/filter';

import './template.html';
import './styles.scss';

const Template = TemplateAny as TemplateStaticTyped<
	'searchField',
	{
		value: string;
		onChange: (newValue: string) => void;
		onFocusOut?: () => void;
	}
>;

const template = Template.searchField;

template.events({
	'keyup .js-search-input': _.debounce((_event, instance) => {
		instance.data.onChange(instance.$('.js-search-input').val() as string);
		// we don't updateURL() here, only after the field loses focus
	}, 200),

	// Update the URI when the search-field was changed an loses focus
	'change .js-search-field'(_event, instance) {
		instance.data.onFocusOut?.();
	},

	'click .js-find-btn'(event, instance) {
		event.preventDefault();

		instance.data.onChange(instance.$('.js-search-input').val() as string);
		instance.data.onFocusOut?.();
	},
});
