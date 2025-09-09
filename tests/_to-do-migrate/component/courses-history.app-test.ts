import { assert } from "chai";
import $ from "jquery";
import { Router } from "meteor/iron:router";
import { Meteor } from "meteor/meteor";

import { MeteorAsync } from "/imports/utils/promisify";
import {
  waitForSubscriptions,
  waitFor,
  setInputValue,
  setSelectValue,
  expectElement,
  expectHtmlButton,
} from "../../../../../tests/_to-do-migrate/utils/ClientUtils.app-test";

if (Meteor.isClient) {
  describe("Course history", function () {
    this.timeout(30000);
    const randomTitle = `COURSEHISTORY${1000 + Math.floor(Math.random() * 9000)}`;

    it("should show a entry for course create", async () => {
      Router.go("proposeCourse");

      await expectElement(".js-title", "New course edit field present");
      await MeteorAsync.loginWithPassword("Seee", "greg");

      // Create the course
      setInputValue(".js-title", randomTitle);
      setSelectValue("[name='region']", "9JyFCoKWkxnf8LWPh"); // Testistan
      (await expectHtmlButton(".course-edit-body .btn-save")).click();

      // We should be redirected to the created course

      await expectElement(".course-details", `Details of the new course ${randomTitle} are shown`);

      const lastNumberOfHistoryEntries = 0;
      await waitFor(() => {
        assert.isAbove(
          $(".coursehistory-event").length,
          lastNumberOfHistoryEntries,
          "A history entry should be presend for course created.",
        );
      });
    });

    // Bases on the previous test
    it("should show a entry for user subscribe", async () => {
      await MeteorAsync.logout();

      await MeteorAsync.loginWithPassword("Flumsi", "greg");

      await waitFor(() => {
        assert($(".loginButton").text().includes("Flumsi"), "User Flumsi sould be logged in.");
      });

      const lastNumberOfHistoryEntries = $(".coursehistory-event").length;

      // Subscribe as user "Flumsi" to course
      // expand
      $("#subscribe button:first").trigger("click");
      await waitForSubscriptions();
      // subscribe
      $("#subscribe button:first").trigger("click");

      await waitFor(() => {
        assert.isAbove(
          $(".coursehistory-event").length,
          lastNumberOfHistoryEntries,
          "A history entry should be presend for user subscribe.",
        );
      });
    });
  });
}
