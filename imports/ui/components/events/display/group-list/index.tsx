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


export function (){
  return <div class="tag-group multiline">
  {{#each allGroups}}
    {{> groupTag groupId=this isOrganizer=isOrganizer}}
    {{#if isOrganizer}}
      <div class="tag group-tag addon">
        <span class="fa-solid fa-bullhorn fa-fw" aria-hidden="true"
              title="{{i18n 'grouplist.organizer.title' attr=true}}"></span>
      </div>
    {{/if}}
    {{#if tools}}
      <div class="btn-group tag-btn group-tag-btn addon align-top">
        <button type="button" class="dropdown-toggle" aria-expanded="false" aria-haspopup="true"
                data-bs-toggle="dropdown">
        </button>
        <ul class="dropdown-menu dialog-dropdown">
          <li class="dropdown-header">
            {{i18n 'grouplist.editgroup.header'}}
            <button type="button" class="btn-close btn-close-white"></button>
          </li>
          <li>
            <hr class="dropdown-divider">
          </li>
          {{#each tools}}
            <li class="dialog-dropdown-btn">{{> toolTemplate}}</li>
          {{/each}}
        </ul>
      </div>
    {{/if}}
  {{/each}}
  {{> eventGroupAdd}}
</div>
}
