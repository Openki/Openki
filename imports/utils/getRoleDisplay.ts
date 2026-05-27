import type { JSX, ReactNode } from "react";
import { i18n } from "i18next";
import { useTranslation } from "react-i18next";

import { getLocalizedValue } from "/imports/utils/getLocalizedValue";
import { PublicSettings, RoleEntity } from "/imports/utils/PublicSettings";

export function getRoleDisplay(i18n: i18n, roles: RoleEntity[]) {
  function getTranslation(
    role: RoleEntity["type"],
    key: keyof NonNullable<RoleEntity["translations"]>,
    variables?: Record<string, ReactNode> | undefined,
  ) {
    // Translations for custom roles can be defined in multiple locations.
    // 1) As part of Region.roles in the DB, allowing custom roles and custom translations for each region.
    // 2) In the `defaultRoles` in the instance settings (`settings.json` file).
    // 3) In the default translations in the `i18n/roles/*.json` files
    // NOTE: Instead of fallback translations, we might want to use the translations strictly defined together with each role. See https://gitlab.com/Openki/Openki/-/work_items/2417 for more details.
    const translation = getLocalizedValue(
      i18n,
      // First see if the translation exists in the roles passed in
      roles.find((r) => r.type === role)?.translations?.[key] ??
        // Otherwise, attempt to get a fallback translation from the instance settings
        PublicSettings.defaultRoles.find((defaultRole) => defaultRole.type === role)
          ?.translations?.[key],
      variables,
    );
    if (translation) {
      return translation;
    }

    // NOTE: Until https://gitlab.com/Openki/Openki/-/work_items/2419 is solved,
    // we use underscores `_` as separators for i18n keys related to roles.
    const roleKey = `${role}_${key}`;

    // Translations for common default roles exist in the roles namespace.
    if (i18n.exists(`roles:${roleKey}`)) {
      return variables ? i18n.t(`roles:${roleKey}`, variables) : i18n.t(`roles:${roleKey}`);
    }

    const missingTranslationMessage = i18n.t(`roles:translationNotFound`, { KEY: key, ROLE: role });
    console.error(`Missing translation "${roleKey}":`, missingTranslationMessage);
    return missingTranslationMessage;
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
      return getTranslation(type, "find_roleNeeded");
    },

    groupListRoleNeeded(type: RoleEntity["type"]) {
      return getTranslation(type, "groupList_statusTitle_roleNeeded");
    },

    groupListRoleOccupied(type: RoleEntity["type"], variables: { NUM: number }) {
      return getTranslation(type, "groupList_statusTitle_roleOccupied", variables);
    },

    groupListRoleOccupiedByUser(type: RoleEntity["type"], variables: { NUM: number }) {
      return getTranslation(type, "groupList_statusTitle_roleOccupiedByUser", variables);
    },

    roleNotificationJoinEmail(
      type: RoleEntity["type"],
      variables: { USERNAME: JSX.Element | string; GROUP: JSX.Element | string },
    ) {
      return getTranslation(type, "notification_join_mail_intro", variables);
    },

    roleGroupFirstSteps(
      type: RoleEntity["type"],
      variables: { COORDINATION_GUIDE: JSX.Element | string },
    ) {
      return getTranslation(type, "group_firstSteps", variables);
    },

    roleGroupMessageInfo(type: RoleEntity["type"]) {
      return getTranslation(type, "group_messageInfo");
    },
  };
}

export function useRoleDisplay(roles: RoleEntity[]) {
  const { i18n } = useTranslation();

  return getRoleDisplay(i18n, roles);
}
