/*
 * This is the main entry point for the client side. It imports all code for the client.
 * The other files in the `/client` folder are also loaded without being referenced with `import`.
 * See more about the file structure and loading in the meteor guide:
 * https://guide.meteor.com/structure.html#javascript-structure
 */

import "@fortawesome/fontawesome-free/css/all.css";

// @ts-expect-error Load the font
import "@fontsource/source-sans-pro";

// Workaround: Import Blaze templates eagerly to they are processed by Meteor
import "./templates.imports";

import "./main.scss";
import "/imports/startup/both";
import "/imports/startup/client";
