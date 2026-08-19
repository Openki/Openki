import type { JSX } from "react";
import { i18n } from "i18next";
import { useTranslation } from "react-i18next";
import { upperFirst } from "lodash-es";

import { RoleEntity } from "/imports/utils/PublicSettings";
import { ReactElement } from "react-markdown/lib/react-markdown";
import { PrimitiveType } from "intl-messageformat";
import { GroupCustomRole } from "/imports/api/groups/groups";

export function getCustomRoleDisplay(i18n: i18n) {
  function getTranslation(
    label: GroupCustomRole["label"],
    key: keyof NonNullable<RoleEntity["translations"]>,
    variables?: Record<string, PrimitiveType> | undefined,
  ): string;
  function getTranslation(
    label: GroupCustomRole["label"],
    key: keyof NonNullable<RoleEntity["translations"]>,
    variables?: Record<string, PrimitiveType | ReactElement> | undefined,
  ): string | ReactElement | (string | ReactElement)[];
  function getTranslation<T extends PrimitiveType | ReactElement>(
    label: GroupCustomRole["label"],
    key: keyof NonNullable<RoleEntity["translations"]>,
    variables?: Record<string, T> | undefined,
  ) {
    const roleVariables = {
      ROLE: label,
      ROLE_upperFirst: upperFirst(label),
    };
    return i18n.t(`roles:${key}`, { ...variables, ...roleVariables });
  }

  return {
    roleDescription(label: GroupCustomRole["label"]) {
      return getTranslation(label, "description");
    },

    roleShort(label: GroupCustomRole["label"]) {
      return getTranslation(label, "short");
    },

    roleProfileUserGroupListCurrent(label: GroupCustomRole["label"], name: string) {
      return getTranslation(label, "profile.userGroupListCurrent", { NAME: name });
    },

    roleProfileUserGroupListPast(label: GroupCustomRole["label"], name: string) {
      return getTranslation(label, "profile.userGroupListPast", { NAME: name });
    },

    roleProfileMyGroupListCurrent(label: GroupCustomRole["label"]) {
      return getTranslation(label, "profile.myGroupListCurrent");
    },

    roleProfileMyGroupListPast(label: GroupCustomRole["label"]) {
      return getTranslation(label, "profile.myGroupListPast");
    },

    roleSubscribe(label: GroupCustomRole["label"]) {
      return getTranslation(label, "subscribe");
    },

    roleSubscribed(label: GroupCustomRole["label"]) {
      return getTranslation(label, "subscribed");
    },

    roleNeeded(label: GroupCustomRole["label"]) {
      return getTranslation(label, "find.roleNeeded");
    },

    groupListRoleNeeded(label: GroupCustomRole["label"]) {
      return getTranslation(label, "groupList.statusTitle.roleNeeded");
    },

    groupListRoleOccupied(label: GroupCustomRole["label"], variables: { NUM: number }) {
      return getTranslation(label, "groupList.statusTitle.roleOccupied", variables);
    },

    groupListRoleOccupiedByUser(label: GroupCustomRole["label"], variables: { NUM: number }) {
      return getTranslation(label, "groupList.statusTitle.roleOccupiedByUser", variables);
    },

    roleNotificationJoinEmailSubject(
      label: GroupCustomRole["label"],
      variables: { USER: string; GROUP: string },
    ) {
      return getTranslation(label, "notification.join.mail.subject", variables);
    },

    roleNotificationJoinEmailIntro(
      label: GroupCustomRole["label"],
      variables: { USER: JSX.Element | string; GROUP: JSX.Element | string },
    ) {
      return getTranslation(label, "notification.join.mail.intro", variables);
    },

    roleGroupFirstSteps(
      label: GroupCustomRole["label"],
      variables: { GUIDE: JSX.Element | string },
    ) {
      return getTranslation(label, "group.firstSteps", variables);
    },

    roleGroupMessageInfo(label: GroupCustomRole["label"]) {
      return getTranslation(label, "group.messageInfo");
    },

    roleGroupHistoryUserSubscribed(
      label: GroupCustomRole["label"],
      variables: { USER: JSX.Element | string },
    ) {
      return getTranslation(label, "group.history.userSubscribed", variables);
    },

    roleGroupHistoryUserUnsubscribed(
      label: GroupCustomRole["label"],
      variables: { USER: JSX.Element | string },
    ) {
      return getTranslation(label, "group.history.userUnsubscribed", variables);
    },
  };
}

export function useCustomRoleDisplay() {
  const { i18n } = useTranslation();

  return getCustomRoleDisplay(i18n);
}
