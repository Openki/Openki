import { Template } from "meteor/templating";
import React from "react";

import { CourseCustomField } from "/imports/api/courses/courses";
import { GroupEntityCustomCourseFields } from "/imports/api/groups/groups";

import {  useLocalizedSetting } from "/imports/utils/getLocalizedValue";

export type Props = {
  fields: GroupEntityCustomCourseFields[];
  values: CourseCustomField[] | undefined;
};

export function EditCustomFields(props: Props) {
  const { getLocalizedValue } = useLocalizedSetting();
  function value(name: string) {
    return props.values?.filter((a) => a.name === name)[0]?.value;
  }

  return props.fields.map((field) => {
    if (field.type !== "boolean")
      return (
        <div key={field.name} className="mb-3">
          <label className="form-label" htmlFor={`course-custom-field-${field.name}`}>
            {getLocalizedValue(field.editText)}
          </label>
          {!field.type || field.type === "singleLine" ? (
            <input
              type="text"
              className={`form-control js-custom-field-${field.name}`}
              id={`course-custom-field-${field.name}`}
              placeholder={getLocalizedValue(field.editPlaceholder)}
              defaultValue={value(field.name) as string}
            />
          ) : (
            <textarea
              className={`form-control js-custom-field-${field.name}`}
              id={`course-custom-field-${field.name}`}
              placeholder={getLocalizedValue(field.editPlaceholder)}
              rows={3}
              defaultValue={value(field.name) as string}
            ></textarea>
          )}
        </div>
      );

    return (
      <div key={field.name} className="mb-3">
        <label className="form-label">{getLocalizedValue(field.editText)}</label>
        <div key={field.name} className="form-check">
          <input
            className={`form-check-input js-custom-field-${field.name}`}
            type="checkbox"
            value=""
            id={`course-custom-field-${field.name}`}
            defaultChecked={(value(field.name) as boolean | undefined) ?? field.defaultValue}
          />
          <label className="form-check-label" htmlFor={`course-custom-field-${field.name}`}>
            {getLocalizedValue(field.editDescription)}
          </label>
        </div>
      </div>
    );
  });
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("EditCustomFields", () => EditCustomFields);
