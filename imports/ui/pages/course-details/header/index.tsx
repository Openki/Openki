import { Meteor } from "meteor/meteor";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";

import * as Alert from "/imports/api/alerts/alert";
import * as CoursesMethods from "/imports/api/courses/methods";
import { CourseModel } from "/imports/api/courses/courses";

import { Editable } from "/imports/ui/lib/editable";

import { i18n } from "/imports/startup/both/i18next";

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
import "/imports/ui/components/single-event-indicator";

import "./template.html";
import "./styles.scss";

const Template = TemplateAny as TemplateStaticTyped<
  "courseDetailsHeader",
  {
    edit: boolean;
    course: CourseModel;
    member: boolean;
    select: string;
  },
  { editableName: Editable }
>;

const template = Template.courseDetailsHeader;

template.onCreated(function () {
  const instance = this;

  instance.busy(false);

  const { course } = instance.data;

  instance.editableName = new Editable(false, i18n("course.title.placeholder"), undefined, {
    onSave: async (newName) => {
      await CoursesMethods.save(course._id, { name: newName });
    },
    onSuccess: (newName) => {
      Alert.success(
        i18n("courseDetails.message.nameChanged", 'The name has been changed to "{NAME}".', {
          NAME: newName,
        }),
      );
    },
    onError: (err) => {
      Alert.serverError(err as string | Error, i18n("course.save.error", "Saving went wrong"));
    },
  });

  instance.autorun(() => {
    const data = Template.currentData();

    if (!data.course) {
      return;
    }

    const { name: courseName } = data.course;

    instance.editableName.setText(courseName);
  });
});

template.helpers({
  // more helpers in course.roles.js

  detailsHeaderAttr(course: CourseModel) {
    const src = course?.publicUrlForDetailsImage();
    if (!src) {
      return {};
    }

    return {
      style: `
		background-image: linear-gradient(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.75)), url('${src}');
		background-position: center;
		background-size: cover;`,
    };
  },

  mayEdit(course: CourseModel) {
    return course?.editableBy(Meteor.user());
  },

  isProposal(course: CourseModel) {
    return !course.nextEvent && !course.lastEvent;
  },
});
