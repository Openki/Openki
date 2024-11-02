import { Meteor } from "meteor/meteor";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";

import { EventModel } from "/imports/api/events/events";

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

import "./add";
import "./make-organizer";
import "./remove";

import "./template.html";
import "./styles.scss";

const Template = TemplateAny as TemplateStaticTyped<"eventGroupList", EventModel>;

const template = Template.eventGroupList;

template.helpers({
  isOrganizer(this: string) {
    const groupId = String(this);
    const { editors } = Template.instance().data;
    return editors?.includes(groupId);
  },
  tools(this: string) {
    const tools = [];
    const user = Meteor.user();
    if (user) {
      const groupId = String(this);
      const event = Template.parentData();

      // Groups may be adopted from the course, these cannot be removed
      const ownGroup = event.groups.includes(groupId);

      if (ownGroup && (user.mayPromoteWith(groupId) || event.editableBy(user))) {
        tools.push({
          toolTemplate: TemplateAny.eventGroupRemove,
          groupId,
          event,
        });
      }
      if (ownGroup && event.editableBy(user)) {
        const hasOrgRights = event.groupOrganizers.includes(groupId);
        tools.push({
          toolTemplate: hasOrgRights
            ? TemplateAny.eventGroupRemoveOrganizer
            : TemplateAny.eventGroupMakeOrganizer,
          groupId,
          event,
        });
      }
    }
    return tools;
  },
});
