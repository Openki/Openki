import { Version } from '/imports/api/version/version';

import { ServerPublishMany } from '/imports/utils/ServerPublish';

export const [all, useAll] = ServerPublishMany('version', () => Version.find());
