import { Router } from "meteor/iron:router";
import { useTranslation } from "react-i18next";
import React from "react";

import { GroupModel } from "/imports/api/groups/groups";

import { cx } from "/imports/utils/cx";

import { GroupCategories } from "../../../groups/categories";
import { Tag } from "/imports/ui/components/regions/tag";
import { OrganizationList } from "../../../groups/display/organization-list";

import "./styles.scss";

export interface Props {
  group?: GroupModel;
  backLink?: string | undefined;
  headerLink?: string;
  regionId: string;
  categories: string[] | undefined;
  organizations?: string[];
  title: string;
  image: string | undefined;
}

export function EventGroupHeader(props: Props) {
  const { t } = useTranslation();
  return (
    <div
      className={cx("event-group-header", props.headerLink && "cursor-pointer")}
      onClick={() => {
        if (props.headerLink) {
          Router.go(props.headerLink);
        }
      }}
      style={
        props.image
          ? {
              backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.75)), url('${props.image}')`,
              backgroundPosition: "center",
              backgroundSize: "cover",
            }
          : undefined
      }
    >
      {!!props.backLink && (
        <>
          <a
            className="back-to-group-overview"
            href={props.backLink}
            title={t("event.details.viewGroup")}
          >
            <i className="fa-solid fa-angle-left fa-fw" />
          </a>
          <a href={props.backLink}>
            <i className="fa-solid fa-angle-left fa-fw" />
            {t("event.details.viewGroup", "To the group overview")}
          </a>
        </>
      )}
      <h2 className="m-0 pb-2 fw-bold">{props.title}</h2>
      {!!props.categories && <GroupCategories categories={props.categories} />}
      {!!props.group && <OrganizationList group={props.group} />}
      <Tag region={props.regionId} />
    </div>
  );
}
