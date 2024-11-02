import { Router } from "meteor/iron:router";
import { i18n } from "/imports/startup/both/i18next";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import moment from "moment";

import { Events } from "/imports/api/events/events";

import * as Metatags from "/imports/utils/metatags";
import { appendAsJsonLdToBody } from "/imports/utils/event-to-json-ld";
import { truncate } from "/imports/utils/string-tools";
import { textPlain } from "/imports/utils/html-tools";

import "/imports/ui/components/buttons";
import "/imports/ui/components/courses/categories";
import "/imports/ui/components/courses/discussion";
import "/imports/ui/components/events/display/course-header";
import "/imports/ui/components/events/display/header";
import "/imports/ui/components/events/display/body";
import "/imports/ui/components/events/display/registration";
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

import "./event";

import "./template.html";

const Template = TemplateAny as TemplateStaticTyped<"eventPage">;

const template = Template.eventPage;

template.onCreated(function () {
  const instance = this;
  instance.autorun(() => {
    const event = Events.findOne(Router.current().params._id);
    let title;
    let description = "";
    if (event) {
      title = i18n("event.windowtitle", "{DATE} – {EVENT}", {
        EVENT: event.title,
        DATE: moment(event.startLocal)
          .locale(Session.get("timeLocale") || "en")
          .format("ddd, MMM D"),
      });
      description = truncate(textPlain(event.description), 160);
      appendAsJsonLdToBody(event);
    } else {
      title = i18n("event.windowtitle.create", "Create event");
    }
    Metatags.setCommonTags(title, description, event?.publicUrlForDetailsImage());
  });
});
