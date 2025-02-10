import { i18n } from "/imports/startup/both/i18next";
import { difference } from "lodash";
import { Meteor } from "meteor/meteor";
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
  TemplateAny as TemplateStaticTyped<"eventGroupAdd", EventModel>,
  "eventGroupAdd",
);

const template = Template.eventGroupAdd;

template.helpers({
  ...GroupNameHelpers,
  groupsToAdd(this: EventModel) {
    const user = Meteor.user();
    return user && difference(user.groups, this.allGroups);
  },
});

template.events({
  async "click .js-add-group"(e, instance) {
    const event = instance.data;
    const groupId = (e.currentTarget as HTMLButtonElement).value;

    try {
      await EventsMethods.promote(event._id, groupId, true);

      const groupName = Groups.findOne(groupId)?.name;
      Alert.success(
        i18n(
          "eventGroupAdd.groupAdded",
          'The group "{GROUP}" has been added to promote the "{EVENT}" event.',
          { GROUP: groupName, EVENT: event.title },
        ),
      );
      instance.collapse();
    } catch (err) {
      Alert.serverError(err, i18n("eventGroupAdd.groupAdded.error", "Failed to add group"));
    }
  },
});


export function EventGroupAdd(){
  return {{#if groupsToAdd}}
  <div class="btn-group tag-btn group-tag-btn align-top">
    <button type="button" class="dropdown-toggle" aria-expanded="false" aria-haspopup="true"
            data-bs-toggle="dropdown">
      <span class="fa-solid fa-plus fa-fw" aria-hidden="true"></span>
      <span>{{i18n 'event.group.addText' 'link a group'}}</span>
    </button>
    <ul class="dropdown-menu dialog-dropdown">
      <li class="dropdown-header">
        {{i18n 'grouplist.addgroups.header'}}
        <button type="button" class="btn-close btn-close-white"></button>
      </li>
      <li>
        <hr class="dropdown-divider">
      </li>
      {{#each groupsToAdd}}
        <li>
          <button class="btn btn-link js-add-group" type="button" value="{{this}}">
            {{name this}}
          </button>
        </li>
      {{/each}}
      <li class="dialog-dropdown-btn">
        <a href="{{pathFor 'groupDetails' _id='create'}}" class="btn btn-success">
          {{i18n 'profile.createNewGroup.button'}}
        </a>
      </li>
    </ul>
  </div>
{{/if}}
}
