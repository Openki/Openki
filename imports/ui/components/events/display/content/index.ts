import { Meteor } from "meteor/meteor";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";

import { Courses } from "/imports/api/courses/courses";
import { EventModel } from "/imports/api/events/events";

import { LocationTracker } from "/imports/ui/lib/location-tracker";

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

import "./template.html";
import "./styles.scss";

{
  const Template = TemplateAny as TemplateStaticTyped<
    "eventContent",
    EventModel,
    { locationTracker: LocationTracker }
  >;

  const template = Template.eventContent;

  template.onCreated(function () {
    const instance = this;
    instance.locationTracker = new LocationTracker();
  });

  template.onRendered(function () {
    const instance = this;
    instance.locationTracker.setRegion(instance.data.region);
    instance.locationTracker.setLocation(instance.data.venue);
  });

  template.helpers({
    eventMarkers() {
      return Template.instance().locationTracker.markers;
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
