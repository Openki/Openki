import type { JSX, ReactNode } from "react";
import { i18n } from "i18next";
import { useTranslation } from "react-i18next";

import { getLocalizedValue } from "/imports/utils/getLocalizedValue";
import { RoleEntity } from "/imports/utils/PublicSettings";

export function getRoleDisplay(i18n: i18n, roles: RoleEntity[]) {
  function getTranslation(
    role: RoleEntity["type"],
    key: keyof NonNullable<RoleEntity["translations"]>,
    variables?: Record<string, ReactNode> | undefined,
  ) {
    // First, check if the current role has a custom translation for the given key
    // These can be defined in multiple places:
    // 1) In the instance settings.json
    // 2) As part of Region.roles in the DB, allowing custom roles and custom translations for each region.
    // NOTE: However, there potential bug with fallback translations here. See https://gitlab.com/Openki/Openki/-/work_items/2417 for more details.
    const translation = getLocalizedValue(
      i18n,
      roles.find((r) => r.type === role)?.translations?.[key],
      variables,
    );
    if (translation) {
      return translation;
    }

    //  Translations for common default roles exist in the roles namespace.
    if (i18n.exists(`roles:${role}.${key}`)) {
      return variables ? i18n.t(`roles:${role}.${key}`, variables) : i18n.t(`roles:${role}.${key}`);
    }

    return i18n.t(`roles:translationNotFound`, { KEY: key, ROLE: role });
  }

  return {
    roleDescription(type: RoleEntity["type"]) {
      return getTranslation(type, "description");
    },

    roleShort(type: RoleEntity["type"]) {
      return getTranslation(type, "short");
    },

    roleUserList(type: RoleEntity["type"], name: string) {
      return getTranslation(type, "userList", { NAME: name });
    },

    roleUserListPast(type: RoleEntity["type"], name: string) {
      return getTranslation(type, "userList.past", { NAME: name });
    },

    roleMyList(type: RoleEntity["type"]) {
      return getTranslation(type, "myList");
    },

    roleMyListPast(type: RoleEntity["type"]) {
      return getTranslation(type, "myList.past");
    },

    roleSubscribe(type: RoleEntity["type"]) {
      return getTranslation(type, "subscribe");
    },

    roleSubscribed(type: RoleEntity["type"]) {
      return getTranslation(type, "subscribed");
    },

    roleNeeded(type: RoleEntity["type"]) {
      return getTranslation(type, "find.roleNeeded");
    },

    groupListRoleNeeded(type: RoleEntity["type"]) {
      return getTranslation(type, "groupList.statusTitle.roleNeeded");
    },

    groupListRoleOccupied(type: RoleEntity["type"], variables: { NUM: number }) {
      return getTranslation(type, "groupList.statusTitle.roleOccupied", variables);
    },

    groupListRoleOccupiedByUser(type: RoleEntity["type"], variables: { NUM: number }) {
      return getTranslation(type, "groupList.statusTitle.roleOccupiedByUser", variables);
    },

    roleNotificationJoinEmail(
      type: RoleEntity["type"],
      variables: { USERNAME: JSX.Element | string; GROUP: JSX.Element | string },
    ) {
      return getTranslation(type, "notification.join.mail.intro", variables);
    },

    roleGroupFirstSteps(
      type: RoleEntity["type"],
      variables: { COORDINATION_GUIDE: JSX.Element | string },
    ) {
      return getTranslation(type, "group.firstSteps", variables);
    },

    roleGroupMessageInfo(type: RoleEntity["type"]) {
      return getTranslation(type, "group.messageInfo");
    },
  };
}

export function useRoleDisplay(roles: RoleEntity[]) {
  const { i18n } = useTranslation();

  return getRoleDisplay(i18n, roles);
}
