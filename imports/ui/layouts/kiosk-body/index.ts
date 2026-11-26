import { Template as TemplateAny, TemplateStaticTyped } from "/imports/utils/templating";

import * as Tooltips from "/imports/utils/Tooltips";

import "/imports/ui/layouts/root.html";
import "/imports/ui/components/alerts";

const Template = TemplateAny as TemplateStaticTyped<"kioskLayout">;

const template = Template.kioskLayout;

template.onRendered(() => {
  Tooltips.enable();
});
