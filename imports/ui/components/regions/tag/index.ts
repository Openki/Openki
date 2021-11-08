import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import { Regions } from '/imports/api/regions/regions';

import './template.html';
import './styles.scss';

const Template = TemplateAny as TemplateStaticTyped<'regionTag'>;

const template = Template.regionTag;

template.helpers({
	show() {
		return !(Regions.findFilter({}, 2).count() === 1);
	},
	regionName() {
		return Regions.findOne(this.region)?.name;
	},
});
