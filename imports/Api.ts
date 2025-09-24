import { Mongo } from "meteor/mongo";
import { Router } from "meteor/iron:router";
import moment from "moment";
import { Users } from "/imports/api/users/users";
import { Courses } from "/imports/api/courses/courses";
import { Events } from "/imports/api/events/events";
import { Groups } from "/imports/api/groups/groups";
import { Venues } from "/imports/api/venues/venues";
import { Geodata, Regions } from "/imports/api/regions/regions";

import { visibleTenantsAsync } from "/imports/utils/visible-tenants";
import { Filtering } from "/imports/utils/filtering";
import { ParamWrapper, Predicate } from "/imports/utils/predicates";
import { FieldSort } from "/imports/utils/sort-spec";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type ExtractQuery<P> = P extends ParamWrapper<infer _G, infer Q> ? Q : never;

type ToFilter<T> = { [name in keyof T]: ExtractQuery<T[name]> };

export interface ApiCollection<T, U, P extends Record<string, Predicate<any>>, F = ToFilter<P>> {
  findFilter(
    filter?: Partial<F>,
    limit?: number,
    skip?: number,
    sort?: FieldSort[],
  ): Mongo.Cursor<T, U>;

  Filtering(): Filtering<P>;
}

export interface ApiEvent {
  id: string;
  title: string;
  description: string;
  startLocal: string;
  endLocal: string;
  start: Date;
  end: Date;
  duration: number;
  noRsvp: boolean;
  maxParticipants: number;
  link: string;
  internal: boolean;
  canceled: boolean;
  room: string;
  slug: string | undefined;
  createdBy?: { id: string; name: string };
  venue?: {
    id: string | undefined;
    name: string | undefined;
    address: string | undefined;
    loc: Geodata | undefined;
    level: number | undefined;
    link: string | undefined;
  };
  course?: {
    id: string;
    name: string;
    link: string;
    image?: string;
    customFields?: { name: string; value: string | boolean }[];
  };
  groups: {
    id: string;
    name: string;
    short: string;
    link: string;
  }[];
}

async function apiResponse<T, U, F extends Record<string, Predicate<any>>, R>(
  collection: ApiCollection<T, U, F, ToFilter<F> & typeof additionalFilters>,
  formatter: (model: U) => Promise<R>,
  additionalFilters = {},
) {
  return async (filter = {}, limit = 0, skip = 0, sort?: FieldSort[]) => {
    const query = collection.Filtering().readAndValidate(filter).toQuery();
    const models = await collection
      .findFilter({ ...query, ...additionalFilters }, limit, skip, sort)
      .fetchAsync();

    const formattedModels: R[] = [];
    for (const model of models) {
      const formattedModel = await formatter(model);
      formattedModels.push(formattedModel);
    }

    return formattedModels;
  };
}

function maybeUrl(route: string, context: { _id?: string } | undefined) {
  if (!context || !context._id) {
    return undefined;
  }
  return Router.url(route, context);
}

export const Api = {
  groups: await apiResponse(Groups, async (originalGroup) => {
    const group = { ...originalGroup } as typeof originalGroup & { link: string };
    group.link = Router.url("groupDetails", group);
    return group;
  }),
  venues: await apiResponse(Venues, async (originalVenue) => {
    const venue = { ...originalVenue } as typeof originalVenue & { link: string };
    venue.link = Router.url("venueDetails", venue);
    return venue;
  }),
  events: await apiResponse(
    Events,
    async (ev) => {
      const evr = {
        id: ev._id,
        title: ev.title,
        description: ev.description,
        startLocal: ev.startLocal,
        endLocal: ev.endLocal,
        start: ev.start,
        end: ev.end,
        duration: moment(ev.end).diff(ev.start) / 60000, // Minutes
        noRsvp: ev.noRsvp,
        maxParticipants: ev.maxParticipants,
        link: Router.url("showEvent", ev),
        internal: ev.internal,
        canceled: ev.canceled,
        room: ev.room,
        slug: ev.slug,
      } as ApiEvent;

      const creator = await Users.findOneAsync(ev.createdBy);
      if (creator) {
        evr.createdBy = {
          id: creator._id,
          name: creator.getDisplayName(),
        };
      }

      if (ev.venue) {
        evr.venue = {
          id: ev.venue._id,
          name: ev.venue.name,
          address: ev.venue.address,
          loc: ev.venue.loc,
          level: ev.venue.level,
          link: maybeUrl("venueDetails", ev.venue),
        };
      }

      if (ev.courseId) {
        const course = await Courses.findOneAsync(ev.courseId);
        if (course) {
          evr.course = {
            id: ev.courseId,
            name: course.name,
            link: Router.url("showCourse", course),
            customFields: course.customFields
              ?.filter((f) => f.visibleFor === "all")
              .map((f) => ({
                name: f.name,
                value: f.value,
              })),
          };

          const image = course.publicUrlForDetailsImage();
          if (image) {
            evr.course.image = image;
          }
        }
      }

      evr.groups = [];
      const groups = ev.allGroups || [];
      for (const groupId of groups) {
        const group = await Groups.findOneAsync(groupId);
        if (group) {
          evr.groups.push({
            id: group._id,
            name: group.name,
            short: group.short,
            link: Router.url("groupDetails", group),
          });
        }
      }

      return evr;
    },
    { tenants: await visibleTenantsAsync() },
  ),
  courses: await apiResponse(
    Courses,
    async (orginalCourse) => {
      const course = {
        id: orginalCourse._id,
        name: orginalCourse.name,
        description: orginalCourse.description,
        link: Router.url("showCourse", orginalCourse),
        image: orginalCourse.publicUrlForDetailsImage(),
        customFields: orginalCourse.customFields
          ?.filter((f) => f.visibleFor === "all")
          .map((f) => ({
            name: f.name,
            value: f.value,
          })),
        internal: orginalCourse.internal,
        interested: orginalCourse.interested,
      } as {
        id: string;
        name: string;
        description: string;
        link: string;
        image?: string;
        customFields?: { name: string; value: string }[];
        internal: boolean;
        interested: number;
        region?: {
          id: string;
          name: string;
        };
        createdBy?: {
          id: string;
          name: string;
        };
        groups: {
          id: string;
          name: string;
          short: string;
          link: string;
        }[];
      };

      const region = await Regions.findOneAsync(orginalCourse.region);
      if (region) {
        course.region = {
          id: region._id,
          name: region.name,
        };
      }

      const creator = await Users.findOneAsync(orginalCourse.createdby);
      if (creator) {
        course.createdBy = {
          id: creator._id,
          name: creator.getDisplayName(),
        };
      }

      course.groups = [];
      const groups = orginalCourse.groups || [];
      groups.forEach(async (groupId) => {
        const group = await Groups.findOneAsync(groupId);
        if (group) {
          course.groups.push({
            id: group._id,
            name: group.name,
            short: group.short,
            link: Router.url("groupDetails", group),
          });
        }
      });

      return course;
    },
    { tenants: await visibleTenantsAsync() },
  ),
};
