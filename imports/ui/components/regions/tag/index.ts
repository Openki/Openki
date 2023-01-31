import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import { Regions } from '/imports/api/regions/regions';

import './template.html';
import './styles.scss';

const Template = TemplateAny as TemplateStaticTyped<'regionTag'>;

const template = Template.regionTag;

template.onCreated(function () {
	const instance = this;

	instance.subscribe('Regions');
});

template.helpers({
	regionName() {
		return Regions.findOne(this.region)?.name;
	},
	hasMultipleRegions() {
		return Regions.findFilter({}, 2).count() > 1;
	},
});
