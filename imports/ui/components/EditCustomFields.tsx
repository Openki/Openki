import React from "react";

import { GroupCustomField } from "/imports/api/groups/groups";
import { OrganizationCustomGroupFields } from "/imports/api/organizations/organizations";

import { useLocalizedSetting } from "/imports/utils/getLocalizedValue";

import { FormControl } from "/imports/ui/components/form-control";
import { FormCheck } from "/imports/ui/components/FormCheck";

export interface Props {
  /** Filter / Edit only specific field types. Default: all */
  type?: "singleLine" | "multiLine" | "option" | "boolean" | undefined;
  fields: OrganizationCustomGroupFields[];
  values: GroupCustomField[] | undefined;
  onChange: (values: GroupCustomField[]) => void;
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
          if (!i.type || i.type === "singleLine" || i.type === "multiLine")
            return {
              name: i.name,
              displayText: i.displayText,
              value: (fieldName === i.name ? newValue : value(i.name)) || "",
              visibleFor: i.visibleFor,
            };

          if (i.type === "option") {
            const v =
              ((fieldName === i.name ? newValue : (value(i.name) ?? i.defaultValue)) as string) ||
              "";
            return {
              name: i.name,
              displayText: i.displayText,
              value: v,
              displayValue: i.options[v],
              visibleFor: i.visibleFor,
            };
          }

          if (i.type === "boolean")
            return {
              name: i.name,
              displayText: i.displayText,
              value: (fieldName === i.name ? newValue : (value(i.name) ?? i.defaultValue)) || false,
              visibleFor: i.visibleFor,
            };

          throw new Error("Unexpected value for type: " + type);
        }),
      );
    };
  }

  return (
    <>
      {fields
        .filter((g) => !type || (g.type || "singleLine") === type)
        .map((field) => {
          return (
            <div key={field.name} className="mb-3">
              {!field.type || field.type === "singleLine" ? (
                <FormControl
                  id={`group-custom-field-${field.name}`}
                  type="text"
                  label={getLocalizedValue(field.editText) ?? ""}
                  placeholder={getLocalizedValue(field.editPlaceholder)}
                  value={value(field.name) as string}
                  onChange={handleChange(field.name)}
                />
              ) : field.type === "multiLine" ? (
                <FormControl
                  id={`group-custom-field-${field.name}`}
                  type="textarea"
                  rows={3}
                  label={getLocalizedValue(field.editText) ?? ""}
                  placeholder={getLocalizedValue(field.editPlaceholder)}
                  value={value(field.name) as string}
                  onChange={handleChange(field.name)}
                />
              ) : field.type === "option" ? (
                <FormControl
                  id={`group-custom-field-${field.name}`}
                  type="select"
                  label={getLocalizedValue(field.editText) ?? ""}
                  options={Object.fromEntries(
                    Object.entries(field.options).map((option) => [
                      option[0],
                      getLocalizedValue(option[1]) || "",
                    ]),
                  )}
                  value={value(field.name) as string}
                  onChange={handleChange(field.name)}
                />
              ) : field.type === "boolean" ? (
                <>
                  <div className="form-label">{getLocalizedValue(field.editText)}</div>
                  <FormCheck
                    id={`group-custom-field-${field.name}`}
                    type="box"
                    label={getLocalizedValue(field.editDescription)}
                    checked={(value(field.name) as boolean | undefined) ?? field.defaultValue}
                    onChange={handleChange(field.name)}
                  />
                </>
              ) : (
                <></>
              )}
            </div>
          );
        })}
    </>
  );
}
