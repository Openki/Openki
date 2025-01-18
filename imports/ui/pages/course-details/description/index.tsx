import { Meteor } from "meteor/meteor";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import { CourseModel } from "/imports/api/courses/courses";

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

export function Description(){
  return <div class="course-details-description" id="course-description">
  {{#if mayEdit}}
    {{> editable editableDescription}}
  {{else}}
    {{{course.description}}}
  {{/if}}
</div>
}
