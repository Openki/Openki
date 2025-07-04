import { Meteor } from "meteor/meteor";
import { Template as TemplateAny, TemplateStaticTyped } from "meteor/templating";
import { Session } from "meteor/session";
import moment from "moment";

import * as Tooltips from "/imports/utils/Tooltips";

import * as Viewport from "/imports/ui/lib/viewport";
import { observeSize } from "../../lib/observeHeight";

import "/imports/ui/layouts/root.html";
import "/imports/ui/components/alerts";

import "./template.html";

const Template = TemplateAny as TemplateStaticTyped<"frameLayout">;

const template = Template.frameLayout;

/** The href/url Openki was loaded. */
const initialHref = document.location.href;

template.onRendered(() => {
  // observe height changes of the frame and send it to the parent. See: https://gitlab.com/Openki/Openki/-/issues/2052
  // You can add the /plugins/iframeHeightAdjust.js into your website to adjust the size of the iframe to the size of the inner content.
  const frame = document.querySelector(".frame");
  if (frame) {
    let startTracking: moment.Moment;
    let heightFirst = 0;
    let heightSecond = 0;

    observeSize(frame, (element: Element) => {
      if (!element.scrollHeight) {
        return;
      }

      // Fix endless flickering, because of height changes based on scrollbar (hide <=> visible change). See: https://gitlab.com/Openki/Openki/-/issues/2153
      if (!startTracking || startTracking.diff(moment()) < -200) {
        // reset height tracking after 200 ms, mybe the height change is because of new user reaction
        startTracking = moment();
        heightFirst = 0;
        heightSecond = 0;
      } else {
        if (!heightFirst) {
          heightFirst = element.scrollHeight;
        } else if (!heightSecond) {
          heightSecond = element.scrollHeight;
        } else if (heightFirst === element.scrollHeight) {
          if (heightFirst < heightSecond) {
            // it is flackering do not send a update
            return;
          } else {
            // it is flackering, but the current size is smaller send a update, and then do not send a update.
            heightSecond = heightFirst;
            heightFirst = element.scrollHeight;
          }
        }
      }

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
