import { Router } from "meteor/iron:router";
import $ from "jquery";
import { Meteor } from "meteor/meteor";
import { MeteorAsync } from "/imports/utils/promisify";

import { expect } from "chai";
import {
  waitForSubscriptions,
  expectElement,
  setTextAreaValue,
  waitFor,
} from "../_to-do-migrate/utils/ClientUtils.app-test";

if (Meteor.isClient) {
  describe("Course members component", function () {
    describe("Subscribe to participant role", function () {
      this.timeout(30000);

      const commentText = "Bi now, gay later.";
      it("should keeps comment", async () => {
        Router.go("/course/6cac962a5f/game-design-mit-unity");
        await waitForSubscriptions();
        const button = await expectElement(
          "button[name=participant]",
          "Join as participant button present",
        );
        $(button).trigger("click");
        // Purposefully only logging in after having decided to participate
        // We want to support this.
        await MeteorAsync.loginWithPassword("Seee", "greg");
        const commentField = await expectElement(".js-comment", "Comment field present");
        setTextAreaValue(commentField, commentText);
        $("#subscribe .btn-save:first").trigger("click");
        const comment = await expectElement(`.course-member-comment-body`);
        waitFor(() =>
          expect(comment.textContent).to.be.equal(
            commentText,
            "User comment visible after joining",
          ),
        );
      });
    });
  });
}
