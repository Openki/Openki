import { WebApp } from "meteor/webapp";
import { Router } from "meteor/iron:router";
import { SitemapStream } from "sitemap";
import { createGzip } from "zlib";

import { CourseModel, Courses } from "/imports/api/courses/courses";
import { Events } from "/imports/api/events/events";
import { Venues } from "/imports/api/venues/venues";
import { Organizations } from "../../api/organizations/organizations";
import { visibleTenantsAsync } from "/imports/utils/visible-tenants";
import { serverError } from "/imports/api/log/methods";
import { LanguagesRaw } from "/imports/api/languages/languages";

function calcCoursePriority(course: CourseModel) {
  if (course.archived) {
    return 0.0; // archived
  }

  if (course.futureEvents > 0) {
    return 0.8; // upcoming
  }

  return 0.6; // proposal/resting
}

async function requestPages() {
  const pages: { url: string; lastmod?: Date | undefined; priority: number }[] = [];
  const courses = Courses.findFilter({ tenants: await visibleTenantsAsync(), internal: false });
  const events = Events.findFilter({ tenants: await visibleTenantsAsync(), internal: false });
  const venues = Venues.find();
  const organizations = Organizations.find();

  const now = new Date();

  // Priorities
  // ==========
  // start page                = 1.0
  // calender page             = 1.0
  // events (future)           = 0.8
  // course (upcoming)         = 0.8
  // course (proposal/resting) = 0.6
  // find page                 = 0.5
  // propose page              = 0.5
  // venues                    = 0.2
  // organizations             = 0.2
  // course (archived)         = 0.0
  // event (past/canceled)     = 0.0

  pages.push({
    url: Router.url("home"),
    priority: 1.0,
  });
  pages.push({
    url: Router.url("calendar"),
    priority: 1.0,
  });
  pages.push({
    url: Router.url("search"),
    priority: 0.5,
  });
  pages.push({
    url: Router.url("proposeCourse"),
    priority: 0.5,
  });

  await courses.forEachAsync((course) => {
    pages.push({
      url: Router.url("showCourse", course),
      lastmod: course.time_lastedit,
      priority: calcCoursePriority(course),
    });
  });
  await events.forEachAsync((event) => {
    pages.push({
      url: Router.url("showEvent", event),
      lastmod: event.time_lastedit,
      priority: event.start > now && !event.canceled ? 0.8 : 0.0,
    });
  });
  await venues.forEachAsync((venue) => {
    pages.push({
      url: Router.url("venueDetails", venue),
      lastmod: venue.updated,
      priority: 0.2,
    });
  });
  await organizations.forEachAsync((organization) => {
    pages.push({
      url: Router.url("organizationDetails", organization),
      lastmod: organization.time_lastedit,
      priority: 0.2,
    });
  });
  return pages;
}

function appendLanguage(urlStr: string, languageCode: string) {
  const url = new URL(urlStr);
  url.searchParams.append("lg", languageCode);
  return url.toString();
}

WebApp.connectHandlers.use("/sitemap.xml", async (_req, res) => {
  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Content-Encoding", "gzip");

  const languages = Object.entries(LanguagesRaw)
    .filter((l) => l[1].visible)
    .map((l) => l[0]);

  try {
    const smStream = new SitemapStream({ lastmodDateOnly: true });
    const pipeline = smStream.pipe(createGzip());

    for (const page of await requestPages()) {
      smStream.write({
        ...page,
        links: languages.map((lg) => ({
          lang: lg,
          url: appendLanguage(page.url, lg),
        })),
      });
    }

    // make sure to attach a write stream such as streamToPromise before ending
    smStream.end();
    // stream write the response
    pipeline.pipe(res).on("error", (e) => {
      throw e;
    });
  } catch (e) {
    res.writeHead(500).end();
    serverError(e);
  }
});
