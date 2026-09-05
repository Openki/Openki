import type { JSX } from "react";
import { i18n } from "i18next";
import { useTranslation } from "react-i18next";
import { upperFirst } from "lodash-es";

import { getLocalizedValue } from "/imports/utils/getLocalizedValue";
import { RoleEntity } from "/imports/utils/PublicSettings";
import { ReactElement } from "react-markdown/lib/react-markdown";
import { PrimitiveType } from "intl-messageformat";
import { $Dictionary } from "i18next/typescript/helpers";
import { isCustom, isPredefined } from "/imports/api/groups/lib/isRole";
import { RoleType } from "/imports/api/groups/lib/Role";

export type Role =
  | { id: RoleEntity["id"]; type: typeof RoleType.Predefined }
  | { label: string; type: typeof RoleType.Custom };

export function getRoleDisplay(i18n: i18n, roles: RoleEntity[]) {
  function getTranslation(
    role: Role,
    key: keyof NonNullable<RoleEntity["translations"]>,
    variables?: Record<string, PrimitiveType> | undefined,
  ): string;
  function getTranslation(
    role: Role,
    key: keyof NonNullable<RoleEntity["translations"]>,
    variables?: Record<string, PrimitiveType | ReactElement> | undefined,
  ): string | ReactElement | (string | ReactElement)[];
  function getTranslation<T extends PrimitiveType | ReactElement>(
    role: Role,
    key: keyof NonNullable<RoleEntity["translations"]>,
    variables?: Record<string, T> | undefined,
  ) {
    let label: string | undefined;
    if (isPredefined(role)) {
      // Translations for custom roles can be defined in multiple locations.
      // (1) As part of Region.roles in the DB and in the `defaultRoles` in the instance
      //     settings (`settings.json` file). Region settings overrides instance settings.
      // (2) In the default translations in the `i18n/roles/*.json` files, translatable by Weblate.
      //     The idea behind this is to monitor how customers use the role and to support them by
      //     integrating more and more standard roles into Openki.
      // (3) When no specific role is defined, fallback to a generic string.

      const customTranslations = roles.find((r) => r.id === role.id)?.translations;

      // (1) Check if a custom translation exists
      const translation = getLocalizedValue(i18n, customTranslations?.[key], variables);
      if (translation) {
        return translation;
      }

      // (2) fallback to a i18n translation if exists.
      // Translations for common default roles exist in the roles namespace.
      const roleKey = `${role.id}.${key}`;
      if (i18n.exists(`roles:${roleKey}`)) {
        return variables
          ? i18n.t(`roles:${roleKey}`, variables as $Dictionary)
          : i18n.t(`roles:${roleKey}`);
      }

      // (3) No translation found, just fallback to a generic string. Using short to build the
      // fallback strings.
      if (key !== "short") {
        label = getLocalizedValue(i18n, customTranslations?.["short"]);
      }
      if (label === undefined) {
        label = role.id;
      }
    } else if (isCustom(role)) {
      label = role.label;
    } else {
      throw new Error("Unexpected value for role.type");
    }
    const roleVariables = {
      ROLE: label,
      ROLE_upperFirst: upperFirst(label),
    };
    return i18n.t(`roles:${key}`, { ...variables, ...roleVariables });
  }

  return {
    roleDescription(role: Role) {
      return getTranslation(role, "description");
    },

    roleShort(role: Role) {
      return getTranslation(role, "short");
    },

    roleProfileUserGroupListCurrent(role: Role, name: string) {
      return getTranslation(role, "profile.userGroupListCurrent", { NAME: name });
    },

    roleProfileUserGroupListPast(role: Role, name: string) {
      return getTranslation(role, "profile.userGroupListPast", { NAME: name });
    },

    roleProfileMyGroupListCurrent(role: Role) {
      return getTranslation(role, "profile.myGroupListCurrent");
    },

    roleProfileMyGroupListPast(role: Role) {
      return getTranslation(role, "profile.myGroupListPast");
    },

    roleSubscribe(role: Role) {
      return getTranslation(role, "subscribe");
    },

    roleSubscribed(role: Role) {
      return getTranslation(role, "subscribed");
    },

    roleNeeded(role: Role) {
      return getTranslation(role, "find.roleNeeded");
    },

    groupListRoleNeeded(role: Role) {
      return getTranslation(role, "groupList.statusTitle.roleNeeded");
    },

    groupListRoleOccupied(role: Role, variables: { NUM: number }) {
      return getTranslation(role, "groupList.statusTitle.roleOccupied", variables);
    },

    groupListRoleOccupiedByUser(role: Role, variables: { NUM: number }) {
      return getTranslation(role, "groupList.statusTitle.roleOccupiedByUser", variables);
    },

    roleNotificationJoinEmailSubject(role: Role, variables: { USER: string; GROUP: string }) {
      return getTranslation(role, "notification.join.mail.subject", variables);
    },

    roleNotificationJoinEmailIntro(
      role: Role,
      variables: { USER: JSX.Element | string; GROUP: JSX.Element | string },
    ) {
      return getTranslation(role, "notification.join.mail.intro", variables);
    },

    roleGroupFirstSteps(role: Role, variables: { GUIDE: JSX.Element | string }) {
      return getTranslation(role, "group.firstSteps", variables);
    },

    roleGroupMessageInfo(role: Role) {
      return getTranslation(role, "group.messageInfo");
    },

    roleGroupHistoryUserSubscribed(role: Role, variables: { USER: JSX.Element | string }) {
      return getTranslation(role, "group.history.userSubscribed", variables);
    },

    roleGroupHistoryUserUnsubscribed(role: Role, variables: { USER: JSX.Element | string }) {
      return getTranslation(role, "group.history.userUnsubscribed", variables);
    },
  };
}

export function useRoleDisplay(roles: RoleEntity[]) {
  const { i18n } = useTranslation();

  return getRoleDisplay(i18n, roles);
}
