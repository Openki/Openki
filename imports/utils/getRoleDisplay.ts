import type { JSX } from "react";
import { i18n } from "i18next";
import { useTranslation } from "react-i18next";
import { upperFirst } from "lodash-es";

import { getLocalizedValue } from "/imports/utils/getLocalizedValue";
import { RoleEntity } from "/imports/utils/PublicSettings";
import { ReactElement } from "react-markdown/lib/react-markdown";
import { PrimitiveType } from "intl-messageformat";
import { $Dictionary } from "i18next/typescript/helpers";

export function getRoleDisplay(i18n: i18n, roles: RoleEntity[]) {
  function getTranslation(
    role: RoleEntity["type"],
    key: keyof NonNullable<RoleEntity["translations"]>,
    variables?: Record<string, PrimitiveType> | undefined,
  ): string;
  function getTranslation(
    role: RoleEntity["type"],
    key: keyof NonNullable<RoleEntity["translations"]>,
    variables?: Record<string, PrimitiveType | ReactElement> | undefined,
  ): string | ReactElement | (string | ReactElement)[];
  function getTranslation<T extends PrimitiveType | ReactElement>(
    role: RoleEntity["type"],
    key: keyof NonNullable<RoleEntity["translations"]>,
    variables?: Record<string, T> | undefined,
  ) {
    // Translations for custom roles can be defined in multiple locations.
    // (1) As part of Region.roles in the DB and in the `defaultRoles` in the instance
    //     settings (`settings.json` file). Region settings overrides instance settings.
    // (2) In the default translations in the `i18n/roles/*.json` files, translatable by Weblate.
    //     The idea behind this is to monitor how customers use the role and to support them by
    //     integrating more and more standard roles into Openki.
    // (3) When no specific role is defined, fallback to a generic string.

    const customTranslations = roles.find((r) => r.type === role)?.translations;

    // (1) Check if a custom translation exists
    const translation = getLocalizedValue(i18n, customTranslations?.[key], variables);
    if (translation) {
      return translation;
    }

    // (2) fallback to a i18n translation if exists.
    // Translations for common default roles exist in the roles namespace.
    const roleKey = `${role}.${key}`;
    if (i18n.exists(`roles:${roleKey}`)) {
      return variables
        ? i18n.t(`roles:${roleKey}`, variables as $Dictionary)
        : i18n.t(`roles:${roleKey}`);
    }

    // (3) No translation found, just fallback to a generic string. Using short to build the
    // fallback strings.
    let label: string | undefined;
    if (key !== "short") {
      label = getLocalizedValue(i18n, customTranslations?.["short"]);
    }
    if (label === undefined) {
      label = role;
    }
    const roleVariables = {
      ROLE: label,
      ROLE_upperFirst: upperFirst(label),
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

    roleProfileUserGroupListCurrent(type: RoleEntity["type"], name: string) {
      return getTranslation(type, "profile.userGroupListCurrent", { NAME: name });
    },

    roleProfileUserGroupListPast(type: RoleEntity["type"], name: string) {
      return getTranslation(type, "profile.userGroupListPast", { NAME: name });
    },

    roleProfileMyGroupListCurrent(type: RoleEntity["type"]) {
      return getTranslation(type, "profile.myGroupListCurrent");
    },

    roleProfileMyGroupListPast(type: RoleEntity["type"]) {
      return getTranslation(type, "profile.myGroupListPast");
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

    notificationJoinEmailSubject(
      type: RoleEntity["type"],
      variables: { USER: string; GROUP: string },
    ) {
      return getTranslation(type, "notification.join.mail.subject", variables);
    },

    notificationJoinEmailIntro(
      type: RoleEntity["type"],
      variables: { USER: JSX.Element | string; GROUP: JSX.Element | string },
    ) {
      return getTranslation(type, "notification.join.mail.intro", variables);
    },

    roleGroupFirstSteps(type: RoleEntity["type"], variables: { GUIDE: JSX.Element | string }) {
      return getTranslation(type, "group.firstSteps", variables);
    },

    roleGroupMessageInfo(type: RoleEntity["type"]) {
      return getTranslation(type, "group.messageInfo");
    },

    groupHistoryUserSubscribed(
      type: RoleEntity["type"],
      variables: { USER: JSX.Element | string },
    ) {
      return getTranslation(type, "group.history.userSubscribed", variables);
    },

    groupHistoryUserUnsubscribed(
      type: RoleEntity["type"],
      variables: { USER: JSX.Element | string },
    ) {
      return getTranslation(type, "group.history.userUnsubscribed", variables);
    },
  };
}

export function useRoleDisplay(roles: RoleEntity[]) {
  const { i18n } = useTranslation();

  return getRoleDisplay(i18n, roles);
}
