import React from "react";
import { useUser } from "/imports/utils/react-meteor-data";
import { useTranslation } from "react-i18next";

import * as Alert from "/imports/api/alerts/alert";
import * as GroupsMethods from "/imports/api/groups/methods";
import { GroupModel } from "/imports/api/groups/groups";

import { Editable, Props as EditableProps } from "/imports/ui/components/editable";
import { InternalIndicator } from "/imports/ui/components/internal-indicator";
import { SingleEventIndicator } from "/imports/ui/components/single-event-indicator";
import { Tag } from "/imports/ui/components/regions/tag";

import { OrganizationList } from "../../../components/groups/display/organization-list";

import "./styles.scss";

export function Header({ group }: { group: GroupModel }) {
  const { t } = useTranslation();

  const user = useUser();

  const editableNameAttr: EditableProps = {
    text: group.name,
    multiline: false,
    placeholder: t("group.title.placeholder"),
    store: {
      onSave: async (newName) => {
        await GroupsMethods.save(group._id, { name: newName });
      },
      onSuccess: (newName) => {
        Alert.success(
          t("groupDetails.message.nameChanged", 'The name has been changed to "{NAME}".', {
            NAME: newName,
          }),
        );
      },
      onError: (err) => {
        Alert.serverError(err as string | Error, t("group.save.error", "Saving went wrong"));
      },
    },
  };

  function detailsHeaderAttr() {
    const src = group?.publicUrlForDetailsImage();
    if (!src) {
      return {};
    }

    return {
      style: {
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.75)), url('${src}')`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      },
    };
  }

  return (
    <div className="details-header" {...detailsHeaderAttr()}>
      {group.internal && <InternalIndicator />}
      {group.singleEvent && <SingleEventIndicator />}
      <div className="details-header-tags">
        {group.hasState() === "proposal" && (
          <div className="proposal-tag">
            <i className="fa-regular fa-lightbulb fa-fw" />
            {t("group.details.is-proposalTag", "Proposal")}
          </div>
        )}
        <Tag region={group.region} />
      </div>
      <div className="group-details-title">
        {group?.editableBy(user) ? <Editable {...editableNameAttr} /> : <h2>{group.name}</h2>}
      </div>
      <OrganizationList group={group} />
    </div>
  );
}
