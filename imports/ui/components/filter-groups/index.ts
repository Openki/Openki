import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { i18n } from '/imports/startup/both/i18next';

import { GroupNameHelpers } from '/imports/ui/lib/group-name-helpers';
import * as Viewport from '/imports/ui/lib/viewport';
import { MeteorAsync } from '/imports/utils/promisify';

import select2 from 'select2';
import 'select2/dist/css/select2.min';
import 'select2-theme-bootstrap5/dist/select2-bootstrap.min';

import './template.html';
import './styles.scss';

(select2 as any)();

const Template = TemplateAny as TemplateStaticTyped<
	'filterGroups',
	{
		availableGroups: string[] | undefined;
		selectedGroups: string[] | undefined;
		onAdd: (group: string) => void;
		onRemove: (group: string) => void;
	}
>;

const template = Template.filterGroups;

template.onCreated(function () {
	const instance = this;

	instance.data.availableGroups?.forEach((group) => {
		instance.subscribe('group', group);
	});
});

template.onRendered(function () {
	const instance = this;

	instance
		.$('.js-groups-select')
		.on('select2:select', (event) => {
			instance.data.onAdd(event.params.data.id);
		})
		.on('select2:unselect', (event) => {
			instance.data.onRemove(event.params.data.id);
		});

	instance.autorun(async () => {
		Viewport.get(); // trigger rerender after viewport resize
		instance.data.selectedGroups?.forEach((group) => {
			// trigger rerender after load
			GroupNameHelpers.name(group);
		});
		if (instance.$('.js-groups-select').hasClass('select2-hidden-accessible')) {
			// Select2 has been initialized
			instance.$('.js-groups-select').select2('destroy');
		}
		await MeteorAsync.defer();

		instance.$('.js-groups-select').select2({
			theme: 'bootstrap',
			templateResult(data: any) {
				// We only really care if there is an element to pull classes from
				if (!data.element) {
					return data.text;
				}

				const $element = $(data.element);

				const $wrapper = $('<span></span>');
				$wrapper.addClass($element[0].className);

				$wrapper.text(data.text);

				return $wrapper;
			},
			placeholder: i18n('filterGroups.placeholder', 'Choose group'),
			language: {
				noResults() {
					return i18n('filterGroups.no-groups-found', 'No groups found');
				},
			},
		});
	});
});

template.helpers({
	groupSelected(group: string) {
		const { data } = Template.instance();
		if (!data.selectedGroups?.includes(group)) {
			return {};
		}
		return { selected: 'selected' };
	},
});

template.helpers(GroupNameHelpers);
