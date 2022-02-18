import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import './template.html';

const Template = TemplateAny as TemplateStaticTyped<
	'button',
	Record<string, string> & { onClick?: () => void }
>;

const template = Template.button;

template.helpers({
	attributes() {
		const instance = Template.instance();

		const attributes = { ...instance.data };

		delete attributes.onClick;

		return { ...attributes };
	},
});

template.events({
	click(event) {
		event.preventDefault();
		Template.instance().data.onClick?.();
	},
});
