import React from "react";

import { CourseCustomField } from "/imports/api/courses/courses";
import { GroupEntityCustomCourseFields } from "/imports/api/groups/groups";

import { useLocalizedSetting } from "/imports/utils/getLocalizedValue";

export interface Props {
  /** Filter / Edit only specific field types. Default: all */
  type?: "boolean" | "singleLine" | "multiLine" | undefined;
  fields: GroupEntityCustomCourseFields[];
  values: CourseCustomField[] | undefined;
  onChange: (values: CourseCustomField[]) => void;
}

export function EditCustomFields({ type, fields, values, onChange }: Props) {
  const { getLocalizedValue } = useLocalizedSetting();
  function value(name: string) {
    return values?.find((a) => a.name === name)?.value;
  }

  function handleTextChange(
    fieldName: string,
  ): React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> | undefined {
    return (event) => {
      onChange(
        fields.map((i) => {
          if (i.type !== "boolean")
            return {
              name: i.name,
              displayText: i.displayText,
              value: (fieldName === i.name ? event.target.value : value(i.name)) || "",
              visibleFor: i.visibleFor,
            };

          return {
            name: i.name,
            displayText: i.displayText,
            value: ((value(i.name) as boolean | undefined) ?? i.defaultValue) || false,
            visibleFor: i.visibleFor,
          };
        }),
      );
    };
  }

  function handleBooleanChange(
    fieldName: string,
  ): React.ChangeEventHandler<HTMLInputElement> | undefined {
    return (event) => {
      onChange(
        fields.map((i) => {
          if (i.type !== "boolean")
            return {
              name: i.name,
              displayText: i.displayText,
              value: value(i.name) || "",
              visibleFor: i.visibleFor,
            };

          return {
            name: i.name,
            displayText: i.displayText,
            value:
              (fieldName === i.name ? event.target.value : (value(i.name) ?? i.defaultValue)) ||
              false,
            visibleFor: i.visibleFor,
          };
        }),
      );
    };
  }

  return (
    <>
      {fields
        .filter((g) => !type || (g.type || "singleLine") === type)
        .map((field) => {
          if (field.type !== "boolean")
            return (
              <div key={field.name} className="mb-3">
                <label className="form-label" htmlFor={`course-custom-field-${field.name}`}>
                  {getLocalizedValue(field.editText)}
                </label>
                {!field.type || field.type === "singleLine" ? (
                  <input
                    type="text"
                    className={`form-control`}
                    id={`course-custom-field-${field.name}`}
                    placeholder={getLocalizedValue(field.editPlaceholder)}
                    value={value(field.name) as string}
                    onChange={handleTextChange(field.name)}
                  />
                ) : (
                  <textarea
                    className={`form-control`}
                    id={`course-custom-field-${field.name}`}
                    placeholder={getLocalizedValue(field.editPlaceholder)}
                    rows={3}
                    value={value(field.name) as string}
                    onChange={handleTextChange(field.name)}
                  ></textarea>
                )}
              </div>
            );

          return (
            <div key={field.name} className="mb-3">
              <label className="form-label">{getLocalizedValue(field.editText)}</label>
              <div key={field.name} className="form-check">
                <input
                  className={`form-check-input`}
                  type="checkbox"
                  id={`course-custom-field-${field.name}`}
                  checked={(value(field.name) as boolean | undefined) ?? field.defaultValue}
                  onChange={handleBooleanChange(field.name)}
                />
                <label className="form-check-label" htmlFor={`course-custom-field-${field.name}`}>
                  {getLocalizedValue(field.editDescription)}
                </label>
              </div>
            </div>
          );
        })}
    </>
  );
}
