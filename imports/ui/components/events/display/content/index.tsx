import { Meteor } from "meteor/meteor";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";

import { Courses } from "/imports/api/courses/courses";
import { EventModel } from "/imports/api/events/events";

import { getLocalizedValue } from "/imports/utils/getLocalizedValue";

import "/imports/ui/components/buttons";
import "/imports/ui/components/courses/categories";
import "/imports/ui/components/events/display/course-header";
import "/imports/ui/components/events/display/header";
import "/imports/ui/components/events/edit";
import "/imports/ui/components/events/participants";
import "/imports/ui/components/events/replication";
import "/imports/ui/components/events/display/group-list";
import "/imports/ui/components/groups/tag";
import "/imports/ui/components/price-policy";
import "/imports/ui/components/regions/tag";
import "/imports/ui/components/sharing";
import "/imports/ui/components/report";
import "/imports/ui/components/venues/link";
import "/imports/ui/components/internal-indicator";
import "/imports/ui/components/delete-confirm-dialog";
import "/imports/ui/components/location/display";

import "./template.html";
import "./styles.scss";

{
  const Template = TemplateAny as TemplateStaticTyped<"eventContent", EventModel>;

  const template = Template.eventContent;

  template.helpers({
    eventMarker() {
      return Template.instance().data.venue?.loc?.coordinates;
    },
    hasVenue(this: EventModel) {
      return this.venue?.loc;
    },
    singleEvent() {
      return Courses.findOne(this.courseId)?.singleEvent;
    },
    customFields() {
      if (!this.courseId) {
        return [];
      }
      const course = Courses.findOne(this.courseId);

      if (!course) {
        return [];
      }

      const user = Meteor.user();

      const isEditor = user && course.editableBy(user);

      return (
        course.customFields
          ?.filter((i) => i.visibleFor === "all" || (i.visibleFor === "editors" && isEditor))
          .map((i) => ({
            displayText: getLocalizedValue(i.displayText),
            isboolean: typeof i.value === "boolean",
            value: i.value,
          })) || []
      );
    },
  });
}

function Content(){
  return {{#if courseId}}
    {{> eventHeader start=startLocal end=endLocal}}
  {{else}}
    {{> eventHeader regionId=this.region start=startLocal end=endLocal}}
  {{/if}}
  <div class="details-body event-details-body">
    <div class="details-content">
      {{#if internal}}
        {{> internalIndicator}}
      {{/if}}
      <div class="row">
        <div class="col-md-7">
          {{#unless singleEvent}}
            <h3>{{this.title}}</h3>

            {{> eventGroupList event=this}}
          {{/unless}}
          <p class="event-details-description">
            {{{description}}}
          </p>

          {{#each info in customFields}}
            <p>
              <strong>{{info.displayText}}</strong>:
              {{#unless info.isboolean}}
                <span class="pre-line">{{info.value}}</span>
              {{else}}
                {{#if info.value}}
                  {{i18n 'customField.boolean.yes' 'Yes'}}
                {{else}}
                  {{i18n 'customField.boolean.no' 'No'}}
                {{/if}}
              {{/unless}}
            </p>
          {{/each}}
        </div>
        <div class="col-md-5">
          <div class="details-map">
            {{#if hasVenue}}
              {{> locationDisplay coordinates=eventMarker}}
            {{/if}}

            <div class="tag-group multiline mt-1">
              {{> venueLink venue=venue room=room}}
            </div>
            {{#if venue.address}}
              <div class="tag">
                <span class="fa-solid fa-location-dot fa-fw" aria-hidden="true"></span>
                {{venue.address}}
              </div>
            {{/if}}
          </div>
        </div>
      </div>
    </div>
    {{#unless isPrivate}}
      {{> pricePolicy dismissable=true wrap='event-details-price-policy'}}
      {{> sharing}}
    {{/unless}}
  </div>
}
