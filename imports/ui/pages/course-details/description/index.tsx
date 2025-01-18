import { Meteor } from "meteor/meteor";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import { CourseModel } from "/imports/api/courses/courses";

import "/imports/ui/components/buttons";
import "/imports/ui/components/courses/display/group-list";
import "/imports/ui/components/courses/categories";
import "/imports/ui/components/courses/discussion";
import "/imports/ui/components/courses/edit";
import "/imports/ui/components/courses/events";
import "/imports/ui/components/courses/history";
import "/imports/ui/components/courses/files";
import "/imports/ui/components/courses/members";
import "/imports/ui/components/courses/roles";
import "/imports/ui/components/editable";
import "/imports/ui/components/groups/tag";
import "/imports/ui/components/price-policy";
import "/imports/ui/components/regions/tag";
import "/imports/ui/components/sharing";
import "/imports/ui/components/report";
import "/imports/ui/components/internal-indicator";

import "./template.html";
import "./styles.scss";

const Template = TemplateAny as TemplateStaticTyped<
  "courseDetailsDescription",
  {
    course: CourseModel;
  }
>;

const template = Template.courseDetailsDescription;

template.helpers({
  mayEdit() {
    const { course } = Template.instance().data;
    return course?.editableBy(Meteor.user());
  },
});
