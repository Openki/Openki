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

template.onRendered(() => {
  // observe height changes of the frame and send it to the parent. See: https://gitlab.com/Openki/Openki/-/issues/2052

  /* You can add the following script in the parent frame to adjust the size of the iframe to the size of the inner content:
  <script>
    // Please configure:
    const iframeId = "openkiIFrameId";

    window.addEventListener("message", function (event) {
      if (!(event.data && event.data.type === "onFrameHeightChange")) {
        return;
      }

      const iframe = document.getElementById(iframeId);
      if (!iframe) {
        throw new Error(
          "iFrame with the Id " + iframeId + " not found. Have you configured it correctly?",
        );
      }

      iframe.style.height = event.data.height + "px";
    });
  </script>
  */

  const frame = document.querySelector(".frame");
  function handleSizeChange(element: Element) {
    const message = {
      type: "onFrameHeightChange",
      height: element.scrollHeight,
    };
    window.parent.postMessage(message, "*");
    if (Meteor.isDevelopment) {
      /* eslint-disable-next-line no-console */
      console.debug(`window.parent.postMessage(${JSON.stringify(message)})`);
    }
  }

  if (frame) {
    observeSize(frame, handleSizeChange);
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
