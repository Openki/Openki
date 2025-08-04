import {
  defaults
} from 'lodash';

import fs from 'fs';

import colors from 'colors';

const defaultConfig = {
  verbose: false,
  extensions: [
    'ttf',
    'woof'
  ],
  map: {}
};

const config = defaults(getConfig('fonts.json'), defaultConfig);

class FontsCompiler {
  processFilesForTarget(files) {
    files.forEach((file) => {
      this.extendFile(file);
      this.processFile(file);
    });
  }

  extendFile(file) {
    file.getCustomPath = function() {
      return config.map[this.getPathInPackage()];
    };
  }

  processFile(file) {
    const customPath = file.getCustomPath();
    const path = file.getPathInPackage();

    if (customPath) {
      this.log(`"${path}" as ${customPath}`);

      file.addAsset({
        data: file.getContentsAsBuffer(),
        path: customPath
      });
    }
  }

  log(msg) {
    if (config.verbose === true) {
      console.log(colors.blue('[Fonts]'), msg);
    }
  }
}

Plugin.registerCompiler({
  extensions: config.extensions
}, () => new FontsCompiler);

function getConfig(configFileName) {
  var path = Plugin.path;

  var appdir = process.env.PWD || process.cwd();
  var custom_config_filename = path.join(appdir, configFileName);
  var userConfig = {};

  if (fs.existsSync(custom_config_filename)) {
    userConfig = fs.readFileSync(custom_config_filename, {
      encoding: 'utf8'
    });
    userConfig = JSON.parse(userConfig);
  }
  return userConfig;
}
