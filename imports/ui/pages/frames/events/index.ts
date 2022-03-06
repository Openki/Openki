import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import { EventEntity, EventModel } from '/imports/api/events/events';

import '/imports/ui/components/events/list';

import './template.html';
import './styles.scss';

const Template = TemplateAny as TemplateStaticTyped<
	'frameEvents',
	Mongo.Cursor<EventEntity, EventModel>
>;

const template = Template.frameEvents;

template.onRendered(function () {
	const instance = this;

	instance.autorun(() => {
		instance.$('a').attr('target', '_blank');
	});
});
