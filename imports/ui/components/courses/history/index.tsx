import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import { Meteor } from "meteor/meteor";

import { Events } from "/imports/api/events/events";
import { CourseModel } from "/imports/api/courses/courses";

import "/imports/ui/components/profile-link";

import "./template.html";
import "./styles.scss";

const Template = TemplateAny as TemplateStaticTyped<"coursehistory", { course: CourseModel }>;

const template = Template.coursehistory;

template.helpers({
  pastEventsList() {
    const instance = Template.instance();
    const { course } = instance.data;

    const historyEntries: { dateTime: Date | undefined; template: string; data: object }[] = [];

    const user = Meteor.user();

    const history =
      user && course.editableBy(user)
        ? course.history
        : course.history?.filter((e) => e.type !== "groupPromote" && e.type !== "groupOrga");

    // add past events
    historyEntries.push(
      ...Events.find(
        { courseId: course._id, start: { $lt: new Date() } },
        { limit: 100 }, // Hack: https://gitlab.com/Openki/Openki/-/issues/1768
      ).map((e) => ({
        dateTime: e.start,
        template: "eventHeldHistoryEntry",
        data: e,
      })),
    );

    // merge with all history entries
    historyEntries.push(
      ...(history?.map((e) => ({
        dateTime: e.dateTime,
        template: `${e.type}HistoryEntry`,
        data: e.data,
      })) || []),
    );

    // and with the course creation
    historyEntries.push({
      dateTime: course.time_created,
      template: "createdHistoryEntry",
      data: course,
    });

    // and sort by date time desc
    return historyEntries
      .sort((a, b) => (b.dateTime?.getTime() || 0) - (a.dateTime?.getTime() || 0))
      .slice(0, 200); // Hack: https://gitlab.com/Openki/Openki/-/issues/1768
  },
});
