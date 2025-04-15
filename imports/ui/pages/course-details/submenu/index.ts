import { Meteor } from "meteor/meteor";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import { ReactiveDict } from "meteor/reactive-dict";

import { CourseModel } from "/imports/api/courses/courses";

import { getLocalizedValue } from "/imports/utils/getLocalizedValue";

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
  "courseDetailsSubmenu",
  {
    edit: boolean;
    course: CourseModel;
    select: string;
  },
  {
    state: ReactiveDict<{
      descriptionTruncated: boolean;
    }>;
  }
>;

const template = Template.courseDetailsSubmenu;

template.onCreated(function () {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const instance = this;
  instance.state = new ReactiveDict();
  instance.state.setDefault({
    descriptionTruncated: true,
  });
});

template.onRendered(function () {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const instance = this;

  instance.autorun(async () => {
    // function to check if the description is longer than the div that displays it
    const courseDescriptionElement = instance.$(".course-description")[0];
    if (courseDescriptionElement) {
      instance.state.set({
        descriptionTruncated:
          courseDescriptionElement.scrollHeight > courseDescriptionElement.clientHeight,
      });
    }
  });
});

template.helpers({
  mayEdit() {
    const { course } = Template.instance().data;
    return course?.editableBy(Meteor.user());
  },
  customFields() {
    const { course } = Template.instance().data;
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

template.events({
  "click .js-course-description-show-more"() {
    // toggles the showMore
    const { state } = Template.instance();
    state.set({ descriptionTruncated: false });
  },

  "click .editable-wrap"() {
    // sets the state when the user starts editing
    const instance = Template.instance();
    instance.state.set({ descriptionTruncated: false });
  },
});
