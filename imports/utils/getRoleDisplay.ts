import { TFunction } from "i18next";
import { RoleEntity } from "/imports/api/regions/regions";

export function getRoleDisplay(t: TFunction) {
  return {
    roleDescription(type: RoleEntity["type"]) {
      return `roles:${type}.description`;
    },

    roleShort(type: RoleEntity["type"]) {
      return t(`roles:${type}.short`);
    },

    roleUserList(type: RoleEntity["type"]) {
      return `roles:${type}.userList`;
    },

    roleUserListPast(type: RoleEntity["type"]) {
      return `roles:${type}.userList.past`;
    },

    roleMyList(type: RoleEntity["type"]) {
      return `roles:${type}.myList`;
    },

    roleMyListPast(type: RoleEntity["type"]) {
      return `roles:${type}.myList.past`;
    },

    roleSubscribe(type: RoleEntity["type"]) {
      return t(`roles:${type}.subscribe`);
    },

    roleSubscribed(type: RoleEntity["type"]) {
      return t(`roles:${type}.subscribed`);
    },
  };
}
