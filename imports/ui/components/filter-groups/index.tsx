import { useTranslation } from "react-i18next";
import { Template } from "meteor/templating";
import React from "react";

import { useDetails } from "/imports/api/groups/publications";

import { ReactSelect2 } from "/imports/ui/components/react-select2";

import { name } from "/imports/ui/lib/group-name-helpers";

interface OptionProps {
  groupId: string;
}

function Option({ groupId }: OptionProps) {
  const [isLoading, group] = useDetails(groupId);

  return (
    <option className="groups-select-option" value={groupId}>
      {isLoading() ? "..." : name(group)}
    </option>
  );
}

export interface Props {
  availableGroups: string[] | undefined;
  selectedGroups: string[] | undefined;
  onAdd: (group: string) => void;
  onRemove: (group: string) => void;
}

export function FilterGroups({ availableGroups, selectedGroups, onAdd, onRemove }: Props) {
  const { t } = useTranslation();

  if (!availableGroups) {
    return null;
  }

  return (
    <ReactSelect2
      className="groups-select form-control"
      multiple={true}
      value={selectedGroups}
      placeholder={t("filterGroups.placeholder", "Choose group")}
      noResults={t("filterGroups.no-groups-found", "No groups found")}
      onSelect={onAdd}
      onUnselect={onRemove}
    >
      {availableGroups.map((groupId) => (
        <Option key={groupId} groupId={groupId} />
      ))}
    </ReactSelect2>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("FilterGroups", () => FilterGroups);
