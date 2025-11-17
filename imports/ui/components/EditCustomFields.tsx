import React from "react";

import { CourseCustomField } from "/imports/api/courses/courses";
import { GroupEntityCustomCourseFields } from "/imports/api/groups/groups";

import { useLocalizedSetting } from "/imports/utils/getLocalizedValue";

import { FormControl } from "/imports/ui/components/form-control";
import { FormCheck } from "/imports/ui/components/FormCheck";

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

  function handleChange(fieldName: string) {
    return (newValue: string | boolean) => {
      onChange(
        fields.map((i) => {
          if (i.type !== "boolean")
            return {
              name: i.name,
              displayText: i.displayText,
              value: (fieldName === i.name ? newValue : value(i.name)) || "",
              visibleFor: i.visibleFor,
            };

          return {
            name: i.name,
            displayText: i.displayText,
            value: (fieldName === i.name ? newValue : (value(i.name) ?? i.defaultValue)) || false,
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
                {!field.type || field.type === "singleLine" ? (
                  <FormControl
                    id={`course-custom-field-${field.name}`}
                    type="text"
                    label={getLocalizedValue(field.editText)}
                    placeholder={getLocalizedValue(field.editPlaceholder)}
                    value={value(field.name) as string}
                    onChange={handleChange(field.name)}
                  />
                ) : (
                  <FormControl
                    id={`course-custom-field-${field.name}`}
                    type="textarea"
                    rows={3}
                    label={getLocalizedValue(field.editText)}
                    placeholder={getLocalizedValue(field.editPlaceholder)}
                    value={value(field.name) as string}
                    onChange={handleChange(field.name)}
                  />
                )}
              </div>
            );

          return (
            <div key={field.name} className="mb-3">
              <div className="form-label">{getLocalizedValue(field.editText)}</div>
              <FormCheck
                id={`course-custom-field-${field.name}`}
                type="switch"
                label={getLocalizedValue(field.editDescription)}
                checked={(value(field.name) as boolean | undefined) ?? field.defaultValue}
                onChange={handleChange(field.name)}
              />
            </div>
          );
        })}
    </>
  );
}
