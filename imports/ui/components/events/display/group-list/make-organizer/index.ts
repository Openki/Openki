import { i18n } from "/imports/startup/both/i18next";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";

import * as Alert from "/imports/api/alerts/alert";
import { EventModel } from "/imports/api/events/events";
import * as EventsMethods from "/imports/api/events/methods";
import { Groups } from "/imports/api/groups/groups";

import { GroupNameHelpers } from "/imports/ui/lib/group-name-helpers";
import * as TemplateMixins from "/imports/ui/lib/template-mixins";

import "/imports/ui/components/buttons";
import "/imports/ui/components/courses/categories";
import "/imports/ui/components/events/display/course-header";
import "/imports/ui/components/events/display/header";
import "/imports/ui/components/events/display/group-list/remove-organizer";
import "/imports/ui/components/events/edit";
import "/imports/ui/components/events/participants";
import "/imports/ui/components/events/replication";
import "/imports/ui/components/groups/tag";
import "/imports/ui/components/price-policy";
import "/imports/ui/components/regions/tag";
import "/imports/ui/components/sharing";
import "/imports/ui/components/report";
import "/imports/ui/components/venues/link";
import "/imports/ui/components/internal-indicator";
import "/imports/ui/components/delete-confirm-dialog";

import "./template.html";

const Template = TemplateMixins.Expandible(
  TemplateAny as TemplateStaticTyped<
    "eventGroupMakeOrganizer",
    { event: EventModel; groupId: string }
  >,
  "eventGroupMakeOrganizer",
);

const template = Template.eventGroupMakeOrganizer;

template.helpers(GroupNameHelpers);
template.events({
  async "click .js-makeOrganizer"(_e, instance) {
    const { event } = instance.data;
    const { groupId } = instance.data;

    try {
      await EventsMethods.editing(event._id, groupId, true);

      const groupName = Groups.findOne(groupId)?.name;
      Alert.success(
        i18n(
          "eventGroupAdd.membersCanEditEvent",
          'Members of the group "{GROUP}" can now edit the "{EVENT}" event.',
          { GROUP: groupName, EVENT: event.title },
        ),
      );
      instance.collapse();
    } catch (err) {
      Alert.serverError(
        err,
        i18n("eventGroupAdd.membersCanEditEvent.error", "Failed to give group editing rights"),
      );
    }
  },
});
