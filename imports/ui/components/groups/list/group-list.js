import { Template } from 'meteor/templating';

import './group-list.html';

Template.groupName.helpers(groupNameHelpers);

Template.groupNameFull.helpers(groupNameHelpers);
