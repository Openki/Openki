import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import './template.html';

const Template = TemplateAny as TemplateStaticTyped<'button', Record<string, string>>;

const template = Template.button;

template.helpers({
	attributes() {
		const instance = Template.instance();

		const attributes = { ...instance.data };

		return { ...attributes };
	},
});
