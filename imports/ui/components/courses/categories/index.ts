import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import { enableTooltips } from '/imports/utils/enableTooltips';

import './template.html';
import './styles.scss';

{
	const Template = TemplateAny as TemplateStaticTyped<'categoryLabelLinked'>;

	const template = Template.categoryLabelLinked;

	template.onRendered(function () {
		const instance = this;
		enableTooltips(instance.firstNode as HTMLElement);
	});
}
