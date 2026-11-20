/*
 * This is the main entry point for the client side. It imports all code for the client.
 * The other files in the `/client` folder are also loaded without being referenced with `import`.
 * See more about the file structure and loading in the meteor guide:
 * https://guide.meteor.com/structure.html#javascript-structure
 */

import "./main.scss";

// @ts-expect-error Load the font
import "@fontsource/source-sans-pro";
import "@fortawesome/fontawesome-free/css/all.css";

import "/imports/startup/both";
import "/imports/startup/client";

// Workaround: Import Blaze templates eagerly so they are processed by Meteor
import "./templates.imports";
