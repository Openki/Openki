import type { JSX, ReactNode } from "react";
import { i18n } from "i18next";
import { useTranslation } from "react-i18next";
import { upperFirst } from "lodash-es";

import { getLocalizedValue } from "/imports/utils/getLocalizedValue";
import { RoleEntity } from "/imports/utils/PublicSettings";

export function getRoleDisplay(i18n: i18n, roles: RoleEntity[]) {
  function getTranslation(
    role: RoleEntity["type"],
    key: keyof NonNullable<RoleEntity["translations"]>,
    variables?: Record<string, ReactNode> | undefined,
  ) {
    // Translations for custom roles can be defined in multiple locations.
    // (1) As part of Region.roles in the DB and in the `defaultRoles` in the instance
    //     settings (`settings.json` file). Region settings overrides instance settings.
    // (2) In the default translations in the `i18n/roles/*.json` files, translatable by Weblate.
    //     The idea behind this is to monitor how customers use the role and to support them by
    //     integrating more and more standard roles into Openki.
    // (3) When no specific is defined fallback to a generic string.

    // (1) Check if a custom translation exists
    const translation = getLocalizedValue(
      i18n,
      roles.find((r) => r.type === role)?.translations?.[key],
      variables,
    );
    if (translation) {
      return translation;
    }

    // (2) fallback to a i18n translation if exists.
    // Translations for common default roles exist in the roles namespace.
    const roleKey = `${role}.${key}`;
    if (i18n.exists(`roles:${roleKey}`)) {
      return i18n.t(`roles:${roleKey}`, { ...variables });
    }

    // (3) None translation are found, just fallback to a generic string.
    const roleVariables = {
      ROLE: role,
      ROLE_upperFirst: upperFirst(role),
    };
    return i18n.t(`roles:${key}`, { ...variables, ...roleVariables });
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
      return getTranslation(type, "userListPast", { NAME: name });
    },

    roleMyList(type: RoleEntity["type"]) {
      return getTranslation(type, "myList");
    },

    roleMyListPast(type: RoleEntity["type"]) {
      return getTranslation(type, "myListPast");
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
