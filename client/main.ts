/*
 * This is the main entry point for the client side. It imports all code for the client.
 * The other files in the `/client` folder are also loaded without being referenced with `import`.
 * See more about the file structure and loading in the meteor guide:
 * https://guide.meteor.com/structure.html#javascript-structure
 */

import "./main.scss";

// Import fonts in TS module so they are handled directly by Rspack instead of passing
// through Sass which may change the output directory of the static font files.
import "@fontsource/source-sans-pro/200.css";
import "@fontsource/source-sans-pro/200-italic.css";
import "@fontsource/source-sans-pro/300.css";
import "@fontsource/source-sans-pro/300-italic.css";
import "@fontsource/source-sans-pro/400.css";
import "@fontsource/source-sans-pro/400-italic.css";
import "@fontsource/source-sans-pro/600.css";
import "@fontsource/source-sans-pro/600-italic.css";
import "@fontsource/source-sans-pro/700.css";
import "@fontsource/source-sans-pro/700-italic.css";
import "@fontsource/source-sans-pro/900.css";
import "@fontsource/source-sans-pro/900-italic.css";
import "@fortawesome/fontawesome-free/css/all.css";

import "/imports/startup/both";
import "/imports/startup/client";

// Workaround: Import Blaze templates eagerly so they are processed by Meteor
import "./templates.imports";
