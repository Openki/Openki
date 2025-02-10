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
  TemplateAny as TemplateStaticTyped<"eventGroupRemove", { event: EventModel; groupId: string }>,
  "eventGroupRemove",
);

const template = Template.eventGroupRemove;

template.helpers(GroupNameHelpers);
template.events({
  async "click .js-remove"(_e, instance) {
    const { event } = instance.data;
    const { groupId } = instance.data;

    try {
      await EventsMethods.promote(event._id, groupId, false);

      const groupName = Groups.findOne(groupId)?.name;
      Alert.success(
        i18n(
          "eventGroupAdd.groupRemoved",
          'The group "{GROUP}" has been removed from the "{EVENT}" event.',
          { GROUP: groupName, EVENT: event.title },
        ),
      );
      instance.collapse();
    } catch (err) {
      Alert.serverError(err, i18n("eventGroupAdd.groupRemoved.error", "Failed to remove group"));
    }
  },
});


export function EventGroupRemove(){
  return   {{#if expanded}}
  <div class="group-tool-dialog danger">
    {{i18n 'event.group.confirmRemoveText' 'Remove the "{NAME}" group from this event?' NAME=(name groupId)}}
    <button type="button" class="btn btn-danger js-remove">
      {{i18n 'course.group.confirmRemoveButton'}}
    </button>
  </div>
{{else}}
  <a href="#" class="js-expand btn btn-danger">
    <span class="fa-solid fa-xmark fa-fw" aria-hidden="true"></span>
    {{i18n 'course.group.remove'}}
  </a>
{{/if}}
}
