import { Template } from 'meteor/templating';

import { GroupNameHelpers } from '/imports/ui/lib/group-name-helpers';

import './template.html';
import './styles.scss';

Template.groupName.helpers(GroupNameHelpers);

Template.groupNameFull.helpers(GroupNameHelpers);
