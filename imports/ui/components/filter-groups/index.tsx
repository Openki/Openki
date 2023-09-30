import { useTranslation } from "react-i18next";
import { Template } from "meteor/templating";
import React from "react";

import { useDetails } from "/imports/api/groups/publications";

import { ReactSelect2 } from "/imports/ui/components/react-select2";

import { name } from "/imports/ui/lib/group-name-helpers";

function Option(props: { groupId: string }) {
  const { groupId } = props;
  const [isLoading, group] = useDetails(groupId);

  return (
    <option className="groups-select-option" value={groupId}>
      {isLoading() ? "..." : name(group)}
    </option>
  );
}

export function FilterGroups(data: {
  availableGroups: string[] | undefined;
  selectedGroups: string[] | undefined;
  onAdd: (group: string) => void;
  onRemove: (group: string) => void;
}) {
  const { t } = useTranslation();

  if (!data.availableGroups) {
    return null;
  }

  return (
    <ReactSelect2
      className="groups-select form-control"
      multiple={true}
      defaultValue={data.selectedGroups}
      placeholder={t("filterGroups.placeholder", "Choose group")}
      noResults={t("filterGroups.no-groups-found", "No groups found")}
      onSelect={data.onAdd}
      onUnselect={data.onRemove}
    >
      {data.availableGroups.map((groupId) => (
        <Option key={groupId} groupId={groupId} />
      ))}
    </ReactSelect2>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("FilterGroups", () => FilterGroups);
