import { i18n } from "/imports/startup/both/i18next";
import { Template } from "meteor/templating";

import { GroupModel, Groups } from "../../api/organizations/organizations";

export function name(group: GroupModel | undefined) {
  if (!group) {
    return i18n("group.missing", "Group does not exist");
  }
  return group.name;
}

function subbedGroup(groupId: string) {
  Template.instance().subscribe("group", groupId);
  return Groups.findOne(groupId);
}

export const GroupNameHelpers = {
  name(groupId: string) {
    if (!groupId) {
      return false;
    }
    const group = subbedGroup(groupId);
    return name(group);
  },
};
