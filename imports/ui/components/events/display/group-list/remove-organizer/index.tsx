import { i18n } from '/imports/startup/both/i18next';
import { Template as TemplateAny, TemplateStaticTyped } from 'meteor/templating';

import * as Alert from '/imports/api/alerts/alert';
import { EventModel } from '/imports/api/events/events';
import * as EventsMethods from '/imports/api/events/methods';
import { Groups } from '/imports/api/groups/groups';

import { GroupNameHelpers } from '/imports/ui/lib/group-name-helpers';
import * as TemplateMixins from '/imports/ui/lib/template-mixins';

const Template = TemplateMixins.Expandible(
	TemplateAny as TemplateStaticTyped<
		'eventGroupRemoveOrganizer',
		{ event: EventModel; groupId: string }
	>,
	'eventGroupRemoveOrganizer',
);

const template = Template.eventGroupRemoveOrganizer;

template.helpers(GroupNameHelpers);
template.events({
	async 'click .js-removeOrganizer'(_e, instance) {
		const { event } = instance.data;
		const { groupId } = instance.data;

		try {
			await EventsMethods.editing(event._id, groupId, false);

			const groupName = Groups.findOne(groupId)?.name;
			Alert.success(
				i18n(
					'eventGroupAdd.membersCanNoLongerEditEvent',
					'Members of the group "{GROUP}" can no longer edit the "{EVENT}" event.',
					{ GROUP: groupName, EVENT: event.title },
				),
			);
			instance.collapse();
		} catch (err) {
			Alert.serverError(
				err,
				i18n(
					'eventGroupAdd.membersCanNoLongerEditEvent.error',
					'Failed to remove organizer status',
				),
			);
		}
	},
});
