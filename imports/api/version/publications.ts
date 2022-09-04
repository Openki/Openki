import Version from '/imports/api/version/version';

import { ServerPublish } from '/imports/utils/ServerPublish';

export const all = ServerPublish('version', () => Version.find());

export default all;
