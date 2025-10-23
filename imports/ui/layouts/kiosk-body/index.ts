import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";

import * as Tooltips from "/imports/utils/Tooltips";

import * as Viewport from "/imports/ui/lib/viewport";

import "/imports/ui/layouts/root.html";
import "/imports/ui/components/alerts";

import "./template.html";

const Template = TemplateAny as TemplateStaticTyped<"kioskLayout">;

const template = Template.kioskLayout;

template.onRendered(() => {
  Viewport.update();
  $(window).on("resize", () => {
    Viewport.update();
  });
  Tooltips.enable();
});
