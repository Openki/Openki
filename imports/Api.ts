import { Mongo } from "meteor/mongo";
import { Router } from "meteor/iron:router";
import moment from "moment";
import { Users } from "/imports/api/users/users";
import { Groups } from "./api/groups/groups";
import { Events } from "/imports/api/events/events";
import { isEventVenueRef } from "./api/events/lib/isEventVenueRef";
import { Organizations } from "./api/organizations/organizations";
import { Venues } from "/imports/api/venues/venues";
import { Regions } from "/imports/api/regions/regions";
import { Geodata } from "/imports/api/Geodata";

import { visibleTenantsAsync } from "/imports/utils/visible-tenants";
import { Filtering } from "/imports/utils/filtering";
import { StateWrapper, Predicate } from "/imports/utils/predicates";
import { FieldSort } from "/imports/utils/sort-spec";

type ExtractQuery<P> = P extends StateWrapper<infer _G, infer Q> ? Q : never;

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
    id?: string | undefined;
    name: string | undefined;
    address: string | undefined;
    loc: Geodata | undefined;
    level: number | undefined;
    link?: string | undefined;
  };
  group?: {
    id: string;
    name: string;
    link: string;
    image?: string;
    customFields?: { name: string; value: string | boolean }[];
  };
  organizations: {
    id: string;
    name: string;
    short: string;
    link: string;
  }[];
}

function apiResponse<T, U, F extends Record<string, Predicate<any>>, R>(
  collection: ApiCollection<T, U, F, ToFilter<F> & typeof additionalFilters>,
  formatter: (model: U) => Promise<R>,
  additionalFilters = {},
) {
  return async (filter = {}, limit = 0, skip = 0, sort?: FieldSort[]) => {
    const query = collection.Filtering().readAndValidate(filter).toQuery();
    const models = await collection
      .findFilter({ ...query, ...additionalFilters }, limit, skip, sort)
      .fetchAsync();

    const formattedModels = await Promise.all(models.map(formatter));
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
  organizations: apiResponse(Organizations, async (originalOrganization) => {
    const organization = { ...originalOrganization } as typeof originalOrganization & {
      link: string;
    };
    organization.link = Router.url("organizationDetails", organization);
    return organization;
  }),
  venues: apiResponse(Venues, async (originalVenue) => {
    const venue = { ...originalVenue } as typeof originalVenue & { link: string };
    venue.link = Router.url("venueDetails", venue);
    return venue;
  }),
  events: apiResponse(
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
        if (isEventVenueRef(ev.venue)) {
          evr.venue = {
            id: ev.venue._id,
            name: ev.venue.name,
            address: ev.venue.address,
            loc: ev.venue.loc,
            level: ev.venue.level,
            link: maybeUrl("venueDetails", ev.venue),
          };
        } else {
          evr.venue = {
            name: ev.venue.name,
            address: ev.venue.address,
            loc: ev.venue.loc,
            level: ev.venue.level,
          };
        }
      }

      if (ev.groupId) {
        const group = await Groups.findOneAsync(ev.groupId);
        if (group) {
          evr.group = {
            id: ev.groupId,
            name: group.name,
            link: Router.url("showGroup", group),
            customFields: group.customFields
              ?.filter((f) => f.visibleFor === "all")
              .map((f) => ({
                name: f.name,
                value: f.value,
              })),
          };

          const image = group.publicUrlForDetailsImage();
          if (image) {
            evr.group.image = image;
          }
        }
      }

      evr.organizations = [];
      const organizations = ev.allOrganizations || [];
      for (const organizationId of organizations) {
        const organization = await Organizations.findOneAsync(organizationId);
        if (organization) {
          evr.organizations.push({
            id: organization._id,
            name: organization.name,
            short: organization.short,
            link: Router.url("organizationDetails", organization),
          });
        }
      }

      return evr;
    },
    { tenants: await visibleTenantsAsync() },
  ),
  groups: apiResponse(
    Groups,
    async (originalGroup) => {
      const group = {
        id: originalGroup._id,
        name: originalGroup.name,
        description: originalGroup.description,
        link: Router.url("showGroup", originalGroup),
        image: originalGroup.publicUrlForDetailsImage(),
        customFields: originalGroup.customFields
          ?.filter((f) => f.visibleFor === "all")
          .map((f) => ({
            name: f.name,
            value: f.value,
          })),
        internal: originalGroup.internal,
        interested: originalGroup.interested,
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
        organizations: {
          id: string;
          name: string;
          short: string;
          link: string;
        }[];
      };

      const region = await Regions.findOneAsync(originalGroup.region);
      if (region) {
        group.region = {
          id: region._id,
          name: region.name,
        };
      }

      const creator = await Users.findOneAsync(originalGroup.createdby);
      if (creator) {
        group.createdBy = {
          id: creator._id,
          name: creator.getDisplayName(),
        };
      }

      group.organizations = [];
      const organizations = originalGroup.organizations || [];
      organizations.forEach(async (organizationId) => {
        const organization = await Organizations.findOneAsync(organizationId);
        if (organization) {
          group.organizations.push({
            id: organization._id,
            name: organization.name,
            short: organization.short,
            link: Router.url("organizationDetails", organization),
          });
        }
      });

      return group;
    },
    { tenants: await visibleTenantsAsync() },
  ),
};
