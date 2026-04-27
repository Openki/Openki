import { TFunction } from "i18next";
import { RoleEntity } from "/imports/api/regions/regions";

export function getRoleDisplay(t: TFunction) {
  return {
    roleDescription(type: RoleEntity["type"]) {
      return t(`roles:${type}.description`);
    },

    roleShort(type: RoleEntity["type"]) {
      return t(`roles:${type}.short`);
    },

    roleUserList(type: RoleEntity["type"], name: string) {
      return t(`roles:${type}.userList`, { NAME: name });
    },

    roleUserListPast(type: RoleEntity["type"], name: string) {
      return t(`roles:${type}.userList.past`, { NAME: name });
    },

    roleMyList(type: RoleEntity["type"]) {
      return t(`roles:${type}.myList`);
    },

    roleMyListPast(type: RoleEntity["type"]) {
      return t(`roles:${type}.myList.past`);
    },

    roleSubscribe(type: RoleEntity["type"]) {
      return t(`roles:${type}.subscribe`);
    },

    roleSubscribed(type: RoleEntity["type"]) {
      return t(`roles:${type}.subscribed`);
    },

    roleNeeded(type: RoleEntity["type"]) {
      return t(`roles:${type}.find.roleNeeded`);
    },
  };
}
