import { Template } from 'meteor/templating';

import GroupNameHelpers from '/imports/ui/lib/group-name-helpers.js';

import './group-list.html';

Template.groupName.helpers(GroupNameHelpers);

Template.groupNameFull.helpers(GroupNameHelpers);
