import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { Session } from "meteor/session";
import { _ } from "meteor/underscore";
import moment from "moment";
import momentTz from "moment-timezone";

import { CourseMemberEntity, CourseModel } from "/imports/api/courses/courses";
import {
  EventEntity,
  EventModel,
  FindFilter as EventsFindFilter,
  OEvent,
  FindParams as EventParamPredicates,
} from "/imports/api/events/events";
import { Group, GroupEntity, GroupModel } from "/imports/api/groups/groups";
import * as Groups from "/imports/api/groups/publications";
import { Region, RegionModel } from "/imports/api/regions/regions";
import * as Regions from "/imports/api/regions/publications";
import * as InfoPages from "/imports/api/infoPages/publications";
import { Tenant, TenantEntity, TenantModel } from "/imports/api/tenants/tenants";
import { Roles } from "/imports/api/roles/roles";
import {
  Venue,
  VenueEntity,
  VenueModel,
  FindParams as VenueParamPredicates,
} from "/imports/api/venues/venues";
import * as Venues from "/imports/api/venues/publications";
import * as Events from "/imports/api/events/publications";
import * as Tenants from "/imports/api/tenants/publications";
import * as Courses from "/imports/api/courses/publications";
import * as Invitations from "/imports/api/invitations/publications";
import * as JoinLinks from "/imports/api/joinLinks/publications";
import * as Users from "/imports/api/users/publications";

import { PublicSettings } from "/imports/utils/PublicSettings";
import { Filtering } from "/imports/utils/filtering";
import { LocalTime } from "/imports/utils/local-time";
import { reactiveNow } from "/imports/utils/reactive-now";
import * as Predicates from "/imports/utils/predicates";
import * as UserPrivilegeUtils from "/imports/utils/user-privilege-utils";
import * as RouterAsync from "/imports/utils/RouterAsync";
import { CleanedRegion } from "/imports/ui/lib/cleaned-region";

import * as Analytics from "/imports/ui/lib/analytics";
import { CourseTemplate } from "/imports/ui/lib/course-template";
import { CssFromQuery } from "/imports/ui/lib/css-from-query";

import type { Data as GroupDetailsData } from "/imports/ui/pages/group-details";
import type { Data as VenuesMapData } from "/imports/ui/pages/venues-map";
import type { Data as EventsMapData } from "/imports/ui/pages/events-map";
import type { Props as FrameEventsMapProps } from "/imports/ui/pages/frames/events-map";
import type { Data as AdminTenantsData } from "/imports/ui/pages/admin/tenants";

const makeFilterQuery = function (
  params: Record<string, string | undefined>,
  day: number,
  oneDayOnly: boolean,
) {
  const filter = new Filtering(EventParamPredicates).read(params).done();

  const query: EventsFindFilter = filter.toQuery();

  let start: moment.Moment | undefined;
  if (params.start) {
    start = moment(params.start).add(day, "days");
  }
  if (!start || !start.isValid()) {
    start = moment(reactiveNow.get()).startOf("day").add(day, "days");
  }

  let end: moment.Moment | undefined;

  if (!oneDayOnly) {
    if (params.end) {
      end = moment(params.end);
    }
  }
  if (!end || !end.isValid()) {
    end = moment(start).add(1, "day");
  }

  query.period = [start.toDate(), end.toDate()];

  return query;
};

function loadRoles(course: CourseModel, member?: CourseMemberEntity) {
  return Roles.filter((r) => course.roles?.includes(r.type)).map((r) => ({
    role: r,
    subscribed: course.userHasRole(Meteor.userId(), r.type),
    comment: member?.comment,
    course,
  }));
}

if (Meteor.isClient) {
  Analytics.installRouterActions();
}

RouterAsync.route("home", {
  path: "/",
  template: "findPage",
  yieldRegions: {
    featuredGroup: { to: "aboveContent" },
  },
  async onRun() {
    await import("/imports/ui/pages/find");
  },
  data() {
    const { query } = this.params;

    // Add filter options for the homepage
    return _.extend(query, {
      internal: false,
      region: Session.get("region"),
    });
  },
});

RouterAsync.route("dashboard", {
  path: "dashboard",
  template: "dashboardPage",
  async onRun() {
    await import("/imports/ui/pages/dashboard");
  },
});

RouterAsync.route("calendar", {
  path: "calendar",
  template: "calendarPage",
  async onRun() {
    await import("/imports/ui/pages/calendar");
  },
  data() {
    return this.params.query;
  },
});

RouterAsync.route("exploreGroups", {
  path: "/explore/groups",
  template: "exploreGroupsPage",
  async onRun() {
    await import("/imports/ui/pages/explore/groups");
  },
});

RouterAsync.route("groupDetails", {
  path: "group/:_id/:short?",
  template: "groupDetailsPage",
  async onRun() {
    await import("/imports/ui/pages/group-details");
  },
  subscriptions() {
    return { details: Groups.details.subscribe(this.params._id as string) };
  },
  data(): GroupDetailsData | undefined {
    let group: GroupModel | undefined;
    const isNew = this.params._id === "create";
    if (isNew) {
      group = new Group() as GroupModel;
    } else {
      group = this.subscriptions()?.details();
    }

    if (!group) {
      return undefined;
    }

    const courseQuery = Object.assign(this.params.query, {
      group: group._id,
      region: Session.get("region"),
    });

    return {
      courseQuery,
      group,
      showCourses: !isNew,
    };
  },
});

RouterAsync.route("info", {
  path: "info/:page_slug",
  template: "infoPage",
  async onRun() {
    await import("/imports/ui/pages/info");
  },
  subscriptions() {
    return {
      infoPage: InfoPages.details.subscribe(this.params.page_slug as string, Session.get("locale")),
    };
  },
  data() {
    const page = this.subscriptions()?.infoPage();
    if (!page) {
      return undefined;
    }

    return { page };
  },
});

RouterAsync.route("profile", {
  path: "profile",
  template: "profilePage",
  async onRun() {
    await import("/imports/ui/pages/profile");
  },
  subscriptions() {
    const userId = Meteor.userId();

    if (!userId) {
      return {};
    }

    return {
      tenants: Tenants.findFilter.subscribe({ adminOf: true }),
      venues: Venues.findFilter.subscribe({ editor: userId }),
      groups: Groups.findFilter.subscribe({ own: true }),
    };
  },
  data() {
    const data: {
      user?: {
        _id: string;
        name: string;
        notifications: boolean;
        allowPrivateMessages: boolean;
        tenants: Mongo.Cursor<TenantEntity, TenantModel> | never[];
        groups: globalThis.Mongo.Cursor<GroupEntity, GroupModel>;
        venues: globalThis.Mongo.Cursor<VenueEntity, VenueModel>;
        email: string;
        verified: boolean;
      };
    } = {};
    const user = Meteor.user();
    const subs = this.subscriptions();
    if (user && subs && subs.tenants) {
      const userdata = {
        _id: user._id,
        name: user.getDisplayName(),
        notifications: user.notifications,
        allowPrivateMessages: user.allowPrivateMessages,
        tenants: subs.tenants(),
        groups: subs.groups(),
        venues: subs.venues(),
        email: user.emails?.[0]?.address,
        verified: user.emails?.[0]?.verified || false,
      };
      data.user = userdata;
    }
    return data;
  },
});

RouterAsync.route("proposeCourse", {
  path: "courses/propose",
  template: "courseProposePage",
  async onRun() {
    await import("/imports/ui/pages/course-create");
  },
  data: CourseTemplate,
});

RouterAsync.route("resetPassword", {
  path: "reset-password/:token",
  template: "resetPasswordPage",
  async onRun() {
    await import("/imports/ui/pages/reset-password");
  },
  data() {
    return { token: this.params.token };
  },
});

RouterAsync.route("showCourse", {
  path: "course/:_id/:slug?",
  template: "courseDetailsPage",
  action() {
    const course = Courses.details.subscribe(this.params._id as string)();
    if (course?.singleEvent && course.nextEvent && this.params.query.force !== "1") {
      this.redirect("showEvent", course.nextEvent, { replaceState: true });
    } else {
      this.render();
    }
  },

  async onRun() {
    await import("/imports/ui/pages/course-details");
  },
  subscriptions() {
    return { courses: Courses.details.subscribe(this.params._id as string) };
  },
  data() {
    const course = this.subscriptions()?.courses();

    if (!course) {
      return undefined;
    }

    const userId = Meteor.userId();
    const member = course.members?.find(
      (memberCandidate: CourseMemberEntity) => memberCandidate.user === userId,
    );
    const data = {
      edit: !!this.params.query.edit,
      rolesDetails: loadRoles(course, member),
      course,
      member,
      select: this.params.query.select,
    };
    return data;
  },
});

RouterAsync.route("createEvent", {
  path: "event/create",
  template: "eventPage",
  async onRun() {
    await import("/imports/ui/pages/event-details");
  },
  subscriptions() {
    const { courseId } = this.params.query;
    if (courseId) {
      return { course: Courses.details.subscribe(courseId) };
    }
    return {};
  },
  data() {
    const subs = this.subscriptions();

    const propose = LocalTime.now().startOf("hour");
    const event = _.extend(new OEvent(), {
      new: true,
      startLocal: LocalTime.toString(propose),
      endLocal: LocalTime.toString(moment(propose).add(2, "hour")),
      sendReminder: PublicSettings.sendReminderPreset,
    }) as EventModel & { new?: boolean; startLocal?: string; endLocal?: string };
    const course = subs?.course?.();
    if (course) {
      event.title = course.name;
      event.courseId = course._id;
      event.region = course.region;
      event.description = course.description;
      event.internal = course.internal;
    }

    return event;
  },
});

RouterAsync.route("showEvent", {
  path: "event/:_id/:slug?",
  template: "eventPage",
  notFoundTemplate: "eventNotFound",
  async onRun() {
    await import("/imports/ui/pages/event-details");
  },
  subscriptions() {
    return {
      event: Events.details.subscribe(this.params._id as string),
    };
  },
  data() {
    const subs = this.subscriptions();

    return subs?.event();
  },
});

RouterAsync.route("userprofile", {
  path: "user/:_id/:username?",
  template: "userprofilePage",
  async onRun() {
    await import("/imports/ui/pages/userprofile");
  },
  subscriptions() {
    return {
      groups: Groups.findFilter.subscribe({ own: true }),
      user: Users.details.subscribe(this.params._id as string),
    };
  },
  data() {
    const sub = this.subscriptions();

    const user = sub?.user();
    if (!user) {
      return undefined; // not loaded?
    }

    // What privileges the user has
    const privileges = (["admin"] as const).reduce<{ [role: string]: boolean }>((originalPs, p) => {
      const ps = { ...originalPs };
      ps[p] = UserPrivilegeUtils.privileged(user, p);
      return ps;
    }, {});

    const alterPrivileges = UserPrivilegeUtils.privilegedTo("admin");
    const showPrivileges = alterPrivileges || user.privileges?.length;

    return {
      user,
      alterPrivileges,
      privileges,
      inviteGroups: sub?.groups(),
      showPrivileges,
    };
  },
});

RouterAsync.route("venueDetails", {
  path: "venue/:_id/:slug?",
  template: "venueDetailsPage",
  async onRun() {
    await import("/imports/ui/pages/venue-details");
  },
  subscriptions() {
    return { details: Venues.details.subscribe(this.params._id as string) };
  },
  data() {
    const id = this.params._id;

    let venue: VenueModel | undefined;
    if (id === "create") {
      venue = new Venue() as VenueModel;
    } else {
      venue = this.subscriptions()?.details();
      if (!venue) {
        return undefined; // Not found
      }
    }

    return { venue };
  },
});

RouterAsync.route("tenantCreate", {
  path: "tenant/create",
  template: "tenantCreatePage",
  async onRun() {
    await import("/imports/ui/pages/tenant-create");
  },
  data() {
    const tenant = new Tenant() as TenantModel;
    const region = new Region() as RegionModel;
    region.tz = momentTz.tz.guess();
    return {
      tenant,
      region,
    };
  },
});

RouterAsync.route("tenantDetails", {
  path: "tenant/:_id/:short?",
  template: "tenantDetailsPage",
  async onRun() {
    await import("/imports/ui/pages/tenant-details");
  },
  subscriptions() {
    return { tenant: Tenants.details.subscribe(this.params._id as string) };
  },
  data() {
    const tenant = this.subscriptions()?.tenant();

    if (!tenant) {
      return undefined;
    }

    return { tenant };
  },
});

RouterAsync.route("invitation", {
  path: "invitation/:token",
  template: "invitationPage",
  async onRun() {
    await import("/imports/ui/pages/invitation");
  },
  subscriptions() {
    const tenantId = this.params?.query?.tenant;
    const invitationToken = this.params?.token;
    if (!tenantId || !invitationToken) {
      return {};
    }

    return {
      invitation: Invitations.details.subscribe(tenantId, invitationToken),
    };
  },
  data() {
    const sub = this.subscriptions();

    if (!sub) {
      return undefined;
    }

    const invitation = sub.invitation?.();
    if (!invitation) {
      return undefined;
    }

    return invitation;
  },
});

RouterAsync.route("join", {
  path: "join/:token",
  template: "joinPage",
  async onRun() {
    await import("/imports/ui/pages/join");
  },
  subscriptions() {
    const tenantId = this.params?.query?.tenant;
    const joinToken = this.params?.token;
    if (!tenantId || !joinToken) {
      return {};
    }

    return {
      joinLink: JoinLinks.details.subscribe(tenantId, joinToken),
    };
  },
  data() {
    const sub = this.subscriptions();

    if (!sub) {
      return undefined;
    }

    const joinLink = sub.joinLink?.();
    if (!joinLink) {
      return undefined;
    }

    return joinLink;
  },
});

RouterAsync.route("venuesMap", {
  path: "venues",
  template: "venuesMapPage",
  async onRun() {
    await import("/imports/ui/pages/venues-map");
  },
  subscriptions() {
    const filter = new Filtering(VenueParamPredicates);
    const region = CleanedRegion(Session.get("region"));
    if (region) {
      filter.add("region", region);
    }
    filter.read(this.params.query).done();
    const query = filter.toQuery();
    return { venues: Venues.findFilter.subscribe(query) };
  },
  data(): VenuesMapData {
    return {
      region: CleanedRegion(Session.get("region")),
      venues: this.subscriptions()?.venues(),
    };
  },
});

RouterAsync.route("eventsMap", {
  path: "events/map",
  template: "eventsMapPage",
  async onRun() {
    await import("/imports/ui/pages/events-map");
  },
  subscriptions() {
    const region = CleanedRegion(Session.get("region"));

    const filter = new Filtering(EventParamPredicates);
    if (region) {
      filter.add("region", region);
    }
    filter.read(this.params.query).done();
    const query = filter.toQuery();
    query.after = moment().startOf("day").toDate();
    return {
      events: Events.findFilter.subscribe({ ...{ canceled: false }, ...query }),
    };
  },
  data(): EventsMapData {
    return {
      region: CleanedRegion(Session.get("region")),
      events: this.subscriptions()?.events(),
    };
  },
});

RouterAsync.route("frame/eventsMap", {
  path: "/frame/events/map",
  template: "frameEventsMapPage",
  layoutTemplate: "frameLayout",
  async onRun() {
    await import("/imports/ui/pages/frames/events-map");
  },
  subscriptions() {
    const filter = new Filtering(EventParamPredicates);
    filter.read(this.params.query).done();
    const query = filter.toQuery();
    query.after = moment().startOf("day").toDate();
    return {
      events: Events.findFilter.subscribe({ ...{ canceled: false }, ...query }),
    };
  },
  data(): FrameEventsMapProps {
    return {
      events: this.subscriptions()?.events(),
    };
  },
});

RouterAsync.route("frameCalendar", {
  path: "/frame/calendar",
  template: "frameCalendarPage",
  layoutTemplate: "frameLayout",
  async onRun() {
    await import("/imports/ui/pages/frames/calendar");
  },
  data() {
    const cssRules = new CssFromQuery(this.params.query, [
      ["itembg", "background-color", ".frame-list-item"],
      ["itemcolor", "color", ".frame-list-item"],
      ["linkcolor", "color", ".frame-list-item a"],
      ["regionbg", "background-color", ".frame-list-item-region"],
      ["regioncolor", "color", ".frame-list-item-region"],
    ]).getCssRules();
    return { cssRules };
  },
});

RouterAsync.route("frameCourselist", {
  path: "/frame/courselist",
  template: "frameCourselistPage",
  layoutTemplate: "frameLayout",
  async onRun() {
    await import("/imports/ui/pages/frames/courselist");
  },
});

RouterAsync.route("frameEvents", {
  path: "/frame/events",
  template: "frameEventsPage",
  layoutTemplate: "frameLayout",
  async onRun() {
    await import("/imports/ui/pages/frames/events");
  },
  data() {
    return this.params.query;
  },
});

RouterAsync.route("framePropose", {
  path: "/frame/propose",
  template: "frameProposePage",
  layoutTemplate: "frameLayout",
  async onRun() {
    await import("/imports/ui/pages/frames/propose");
  },
  subscriptions() {
    return { regions: Regions.all.subscribe() };
  },
  data() {
    const predicates = {
      region: Predicates.id,
      addTeamGroups: Predicates.ids,
      neededRoles: Predicates.ids,
      setCreatorsRoles: Predicates.ids,
      internal: Predicates.flag,
      hidePricePolicy: Predicates.flag,
      hideCategories: Predicates.flag,
      singleEvent: Predicates.flag,
    };
    const query = new Filtering(predicates).read(this.params.query).done().toQuery() as any;

    if (query.addTeamGroups) {
      // For security reasons only 5 groups are allowed
      query.teamGroups = query.addTeamGroups.slice(0, 5);
    }
    delete query.addTeamGroups;

    if (!query.neededRoles) {
      query.neededRoles = ["mentor"];
    }
    if (query.setCreatorsRoles) {
      query.hideRoleSelection = true;
    } else {
      query.setCreatorsRoles = [];
    }
    query.roles = ["mentor", "host"].filter(
      (role) => query.neededRoles.includes(role) || query.setCreatorsRoles.includes(role),
    );
    delete query.neededRoles;

    query.creatorsRoles = ["mentor", "host"].filter((role) =>
      query.setCreatorsRoles.includes(role),
    );
    delete query.setCreatorsRoles;

    query.isFrame = true;

    return query;
  },
});

RouterAsync.route("frameSchedule", {
  path: "/frame/schedule",
  template: "frameSchedulePage",
  layoutTemplate: "frameLayout",
  async onRun() {
    await import("/imports/ui/pages/frames/schedule");
  },
});

RouterAsync.route("frameWeek", {
  path: "/frame/week",
  template: "frameWeekPage",
  layoutTemplate: "frameLayout",
  async onRun() {
    await import("/imports/ui/pages/frames/week");
  },
  data() {
    return this.params.query;
  },
});

RouterAsync.route("kioskEvents", {
  path: "/kiosk/events",
  template: "kioskEventsPage",
  layoutTemplate: "kioskLayout",
  async onRun() {
    await import("/imports/ui/pages/kiosk/events");
  },
  subscriptions() {
    const now = reactiveNow.get(); // Time dependency so this will be reactively updated
    const tomorrow = new Date(now);
    tomorrow.setHours(tomorrow.getHours() + 24);
    tomorrow.setHours(0);

    const filter = new Filtering(EventParamPredicates).read(this.params.query).done();
    Session.set("kioskRoute", "kioskEvents");
    Session.set("kioskFilter", filter.toParams());

    const queryFuture: EventsFindFilter = filter.toQuery();
    queryFuture.after = tomorrow;

    const queryToday: EventsFindFilter = filter.toQuery();
    queryToday.after = now;
    queryToday.before = tomorrow;

    const limit = Number.parseInt(this.params.query.count || "", 10) || 20;

    const queryNow: EventsFindFilter = filter.toQuery();
    queryNow.ongoing = now;

    return {
      today: Events.findFilter.subscribe({ ...{ canceled: false }, ...queryToday }, limit),
      future: Events.findFilter.subscribe({ ...{ canceled: false }, ...queryFuture }, limit),
      ongoing: Events.findFilter.subscribe({ ...{ canceled: false }, ...queryNow }),
    };
  },
  data() {
    const sub = this.subscriptions();

    const filter = new Filtering(EventParamPredicates).read(this.params.query).done();

    const filterParams = filter.toQuery();
    return {
      today: sub?.today(),
      future: sub?.future(),
      ongoing: sub?.ongoing(),
      filter: filterParams,
    };
  },
  onAfterAction() {
    (this as any).timer = Meteor.setInterval(() => {
      Session.set("seconds", new Date());
    }, 1000);
  },
  onStop() {
    Meteor.clearInterval((this as any).timer);
  },
});

RouterAsync.route("timetable", {
  path: "/kiosk/timetable",
  template: "kioskTimetablePage",
  layoutTemplate: "kioskLayout",
  async onRun() {
    await import("/imports/ui/pages/kiosk/timetable");
  },
  subscriptions() {
    const control = this.params.query.control !== "0";
    const day = Number.parseInt(this.params.query.day || "0", 10);
    const query = makeFilterQuery(this.params.query, day, control);

    const filter = new Filtering(EventParamPredicates).read(this.params.query).done();
    Session.set("kioskRoute", "timetable");
    Session.set("kioskFilter", filter.toParams());

    return {
      events: Events.findFilter.subscribe({ ...{ canceled: false }, ...query }, 200),
    };
  },
  data() {
    const control = this.params.query.control !== "0";
    const day = Number.parseInt(this.params.query.day || "0", 10);
    const filter = new Filtering(EventParamPredicates).read(this.params.query).done();
    let dayLimit: number | undefined;
    if (filter.get("start") && filter.get("end")) {
      dayLimit = moment(filter.get("end")).diff(filter.get("start"), "days");
    }

    let start: moment.MomentInput;
    let end: moment.MomentInput;

    const events = this.subscriptions?.()?.events().fetch();

    // collect time when first event starts and last event ends
    events.forEach((event: EventModel) => {
      if (!start || event.start < start) {
        start = event.start;
      }
      if (!end || end < event.end) {
        end = event.end;
      }
    });

    if (!start || !end) {
      return {
        control,
        day,
        dayLimit,
        filter,
        days: [],
        hours: [],
        grouped: [],
        future_length: 0,
      };
    }

    start = moment(start).startOf("hour");
    end = moment(end).startOf("hour");

    const timestampStart = start.toDate().getTime();
    const timestampEnd = end.toDate().getTime();

    const span = timestampEnd - timestampStart;

    const days: { [day: string]: { moment: moment.Moment; relStart: number; relEnd: number } } = {};
    const hours: { [hour: string]: { moment: moment.Moment; relStart: number; relEnd: number } } =
      {};
    const cursor = moment(start);
    do {
      const month = cursor.month();
      const cursorDay = cursor.day();
      days[`${month}${cursorDay}`] = {
        moment: moment(cursor).startOf("day"),
        relStart: Math.max(
          -0.1,
          (moment(cursor).startOf("day").toDate().getTime() - timestampStart) / span,
        ),
        relEnd: Math.max(
          -0.1,
          (timestampEnd - moment(cursor).startOf("day").add(1, "day").toDate().getTime()) / span,
        ),
      };
      const hour = cursor.hour();
      hours[`${month}${cursorDay}${hour}`] = {
        moment: moment(cursor).startOf("hour"),
        relStart: Math.max(
          -0.1,
          (moment(cursor).startOf("hour").toDate().getTime() - timestampStart) / span,
        ),
        relEnd: Math.max(
          -0.1,
          (timestampEnd - moment(cursor).startOf("hour").add(1, "hour").toDate().getTime()) / span,
        ),
      };
      cursor.add(1, "hour");
    } while (cursor.isBefore(end));

    const perVenue: {
      [venue: string]: {
        venue: VenueModel;
        perRoom: {
          [room: string]: {
            room: string;
            venue: VenueModel;
            rows: (EventEntity & {
              relStart: number;
              relEnd: number;
            })[];
          };
        };
      };
    } = {};
    const useVenue = function (venue: any, room: any) {
      const id = venue._id || `#${venue.name}`;
      if (!perVenue[id]) {
        perVenue[id] = {
          venue,
          perRoom: {
            [room]: {
              room,
              venue,
              rows: [],
            },
          },
        };
      } else if (!perVenue[id].perRoom[room]) {
        perVenue[id].perRoom[room] = {
          room,
          venue,
          rows: [],
        };
      }
      return perVenue[id].perRoom[room].rows;
    };

    events.forEach((originalEvent: EventModel) => {
      const event = originalEvent as EventModel & {
        relStart: number;
        relEnd: number;
      };
      event.relStart = (originalEvent.start.getTime() - timestampStart) / span;
      event.relEnd = (timestampEnd - originalEvent.end.getTime()) / span;

      let placed = false;

      const room = event.room || null;
      const roomRows = useVenue(event.venue, room) as unknown as (EventModel & {
        relStart: number;
        relEnd: number;
      })[][];
      roomRows.forEach((roomRow) => {
        if (placed) {
          return;
        }
        let last: any;
        roomRow.forEach((placedEvent: any) => {
          if (!last || placedEvent.end > last) {
            last = placedEvent.end;
          }
        });
        if (last <= event.start) {
          roomRow.push(event);
          placed = true;
        }
      });
      if (!placed) {
        roomRows.push([event]);
      }
    });

    // Transform the "rows" objects to arrays and sort the room rows by
    // the room name, so "null" (meaning no room) comes first.
    const grouped = Object.values(perVenue).map((venueData) => {
      const perRoom = Object.values(venueData.perRoom).sort();
      return {
        control,
        day,
        dayLimit,
        filter,
        ...venueData,
        perRoom,
      };
    });

    return {
      control,
      day,
      dayLimit,
      filter,
      now: (moment.utc().toDate().getTime() - timestampStart) / span,
      days: Object.values(days),
      hours: Object.values(hours),
      grouped,
      future_length: events.length,
    };
  },
});

RouterAsync.route("adminPanel", {
  path: "admin",
  template: "adminPanelPage",
  async onRun() {
    await import("/imports/ui/pages/admin/panel");
  },
});

RouterAsync.route("featureGroup", {
  path: "admin/feature-group",
  template: "adminFeatureGroupPage",
  async onRun() {
    await import("/imports/ui/pages/admin/feature-group");
  },
});

RouterAsync.route("tenants", {
  path: "admin/tenants",
  template: "adminTenantsPage",
  async onRun() {
    await import("/imports/ui/pages/admin/tenants");
  },
  subscriptions() {
    return { findFilter: Tenants.findFilter.subscribe() };
  },
  data(): AdminTenantsData {
    return { tenants: this.subscriptions()?.findFilter() };
  },
});

RouterAsync.route("regionCreate", {
  path: "region/create",
  template: "regionDetailsPage",
  async onRun() {
    await import("/imports/ui/pages/region-details");
  },
  data() {
    const region = new Region() as RegionModel;

    const tenantId = this.params.query.tenant;

    if (!tenantId) {
      return undefined;
    }

    region.tenant = tenantId;
    region.tz = momentTz.tz.guess();
    return {
      isNew: true,
      region,
    };
  },
});

RouterAsync.route("regionDetails", {
  path: "region/:_id/:slug?",
  template: "regionDetailsPage",
  async onRun() {
    await import("/imports/ui/pages/region-details");
  },
  subscriptions() {
    return { details: Regions.details.subscribe(this.params._id as string) };
  },
  data() {
    const region = this.subscriptions()?.details();

    if (!region) {
      return undefined; // Not found
    }

    return { region };
  },
});

RouterAsync.route("users", {
  path: "admin/users",
  template: "adminUsersPage",
  async onRun() {
    await import("/imports/ui/pages/admin/users");
  },
});

RouterAsync.route("stats", {
  path: "stats",
  template: "statsPage",
  async onRun() {
    await import("/imports/ui/pages/stats");
  },
});

RouterAsync.route("log", {
  path: "/log",
  template: "logPage",
  async onRun() {
    await import("/imports/ui/pages/log");
  },
  data() {
    return this.params.query;
  },
});
