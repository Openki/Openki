import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import './modal';

import './template.html';

const Template = TemplateAny as TemplateStaticTyped<
	'deleteCourseEvents',
	{ onShowEventsDeleteModal: () => void }
>;

const template = Template.deleteCourseEvents;

template.events({
	'mouseover/mouseout .js-show-events-delete-modal'(event, instance) {
		// mouseover/mouseout doesn't get caught on child elements. so we get it
		const caption = instance.$(event.currentTarget as any).children('.event-caption-action');
		caption.toggleClass('event-caption-placeholder', event.type === 'mouseout');
	},

	'click .js-show-events-delete-modal'(_event, instance) {
		instance.data.onShowEventsDeleteModal();
	},
});
