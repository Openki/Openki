import { Meteor } from "meteor/meteor";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import { Session } from "meteor/session";

import * as Tooltips from "/imports/utils/Tooltips";

import * as Viewport from "/imports/ui/lib/viewport";
import { observeSize } from "../../lib/observeHeight";

import "/imports/ui/layouts/root.html";
import "/imports/ui/components/alerts";

import "./template.html";

const Template = TemplateAny as TemplateStaticTyped<"frameLayout">;

const template = Template.frameLayout;

function between(x: number, min: number, max: number) {
  return x >= min && x <= max;
}

/** The href/url Openki was loaded. */
const initialHref = document.location.href;

template.onRendered(() => {
  // observe height changes of the frame and send it to the parent. See: https://gitlab.com/Openki/Openki/-/issues/2052
  // You can add the /plugins/iframeHeightAdjust.js into your website to adjust the size of the iframe to the size of the inner content.
  const frame = document.querySelector(".frame");
  if (frame) {
    let lastHeight = 0;

    observeSize(frame, (element: Element) => {
      if (!element.scrollHeight) {
        return;
      }

      // Fix endless flickering, because of small height changes. See: https://gitlab.com/Openki/Openki/-/issues/2153
      if (between(element.scrollHeight, lastHeight - 1, lastHeight + 1)) {
        return;
      }

      lastHeight = element.scrollHeight;

      const message = {
        type: "onFrameHeightChange",
        height: element.scrollHeight,
        src: initialHref,
      };
      window.parent.postMessage(message, "*");
      if (Meteor.isDevelopment) {
        /* eslint-disable-next-line no-console */
        console.debug(`window.parent.postMessage(${JSON.stringify(message)})`);
      }
    });
  }

  Viewport.update();
  $(window).on("resize", () => {
    Viewport.update();
  });
  Session.set("isRetina", window.devicePixelRatio === 2);
  Tooltips.enable();
});

template.events({
  /* Workaround to prevent iron-router from messing with server-side downloads
   *
   * Class 'js-download' must be added to those links.
   */
  "click .js-download"(event) {
    event.stopPropagation();
  },
});
