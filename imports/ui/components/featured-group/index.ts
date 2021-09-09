import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';
import { Groups, GroupModel } from '/imports/api/groups/groups';
import { Regions } from '/imports/api/regions/regions';

import './template.html';
import './styles.scss';

const Template = TemplateAny as TemplateStaticTyped<
	Record<string, unknown>,
	'featuredGroup',
	{ featuredGroupId: () => string | undefined; featuredGroup: () => GroupModel | undefined }
>;

const template = Template.featuredGroup;

template.onCreated(function () {
	this.featuredGroupId = () => {
		const region = Regions.currentRegion();
		if (!region?.featuredGroup) {
			return undefined;
		}
		return region.featuredGroup;
	};

	this.featuredGroup = () => {
		const groupId = this.featuredGroupId();
		if (!groupId) {
			return undefined;
		}
		return Groups.findOne(groupId);
	};

	this.autorun(() => {
		const groupId = this.featuredGroupId();
		if (groupId) {
			this.subscribe('group', groupId);
		}
	});
});

template.helpers({
	featuredGroup: () => Template.instance().featuredGroup(),
});
