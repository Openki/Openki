import { Router } from "meteor/iron:router";

import "/imports/ui/layouts";
import "/imports/ui/pages";

Router.configure({
  layoutTemplate: "layout",
  notFoundTemplate: "notFound",
  loadingTemplate: "loadingPage",
});
Router.onBeforeAction("dataNotFound");
