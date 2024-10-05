import { assert } from "chai";
import { Router } from "meteor/iron:router";
import $ from "jquery";
import { Meteor } from "meteor/meteor";

import {
  waitForSubscriptions,
  waitFor,
  setInputValue,
  setSelectValue,
} from "/imports/ClientUtils.app-test";
import { MeteorAsync } from "/imports/utils/promisify";

if (Meteor.isClient) {
  describe("Course details", () => {
    describe("Organizer group course", function () {
      this.timeout(30000);

      it("should allow to set a group as organizer", async () => {
        Router.go("/course/e49ed1ce5d");
        await MeteorAsync.loginWithPassword("greg", "greg");
        await waitForSubscriptions();

        await waitFor(() => {
          assert(
            $(".group-tag-btn .dialog-dropdown-btn").length > 0,
            `Show info editing rights to group button is shown`,
          );
        });

        await waitFor(() => {
          $(".dropdown-menu .btn-success")[0].click();
          assert(
            $(".group-tag-btn .dialog-dropdown-btn .btn-success").length > 0,
            `Give editing rights to group button is shown`,
          );
        });

        await waitFor(() => {
          $(".dropdown-menu .btn-success")[0].click();
          assert($(".group-tag-is-organizer").length > 0, `Group is organizer`);
        });
      });

      it("should allow a member a organizer group to send a message to all", async () => {
        Router.go("/course/e49ed1ce5d");
        await MeteorAsync.loginWithPassword("greg", "greg");
        await waitForSubscriptions();

        await waitFor(() => {
          assert(
            $("#discussion .btn-add.page-component-btn").length > 0,
            `Write a comment is shown`,
          );
        });

        document.getElementById("discussion")?.dispatchEvent(new Event("notifyAll"));

        await waitFor(() => {
          assert($("#canNotifyAllCheck").length > 0, `Notify all interested checkbox is shown`);
        });

        $(".discussion-edit-body .richtext").html("Hello to all");

        document
          .querySelector(".discussion-edit-body .richtext")
          ?.dispatchEvent(new Event("keyup", { bubbles: true }));

        await waitFor(() => {
          assert($(".discussion-save-btn:not([disabled])").length > 0, `Save button is active`);
        });

        $(".discussion-save-btn").trigger("click");
        await waitFor(() => {
          assert($(".discussion-post-body").length > 0, `Message is visible`);
        });
      });
    });
    describe("Archive course", function () {
      this.timeout(30000);

      it("should allow to archive a course internal", async () => {
        const randomTitle = `ARCHIVED${1000 + Math.floor(Math.random() * 9000)}`;

        Router.go("/");
        const haveEditfield = () => {
          assert($(".js-title").length > 0, "New course edit field present");
        };
        await MeteorAsync.loginWithPassword("greg", "greg");
        await waitForSubscriptions();
        await waitFor(haveEditfield);

        // Create the course
        setInputValue(".js-title", randomTitle);
        setSelectValue("[name='region']", "9JyFCoKWkxnf8LWPh"); // Testistan
        $(".course-edit-body .btn-save")[0].click();

        // We should be redirected to the created course

        await waitFor(() => {
          assert(
            $(".course-details").length > 0,
            `Details of the new course ${randomTitle} are shown`,
          );
        });

        $(".js-course-archive").trigger("click");

        Router.go("/");

        await waitFor(() => {
          assert(
            !$("body").text().includes(randomTitle),
            `The archived course should not be visible on the start page ${window.location}`,
          );
        }, 5000);

        Router.go("/?archived=1");

        await waitFor(() => {
          assert(
            !$("body").text().includes(randomTitle),
            `The archived course should be visible on the start page ${window.location} with archived filter on`,
          );
        }, 5000);
      });
    });
  });
}
