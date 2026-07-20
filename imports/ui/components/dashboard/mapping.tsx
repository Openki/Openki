import React from "react";
import { Router } from "meteor/iron:router";
import { PublicSettings } from "/imports/utils/PublicSettings";

import { Groups as GroupCollection, GroupModel } from "/imports/api/groups/groups";
import { Events as EventCollection, EventModel } from "/imports/api/events/events";
import {
  Organizations as OrganizationCollection,
  OrganizationModel,
} from "/imports/api/organizations/organizations";
import * as Groups from "/imports/api/groups/publications";
import * as Events from "/imports/api/events/publications";
import * as Organizations from "/imports/api/organizations/publications";

import { Filtering } from "/imports/utils/filtering";
import { Publication } from "/imports/utils/ServerPublishReact";

import { Edit } from "../groups/edit";
import { GroupCompact } from "../groups/compact";
import { EventCompact } from "../../components/events/compact";
import { EventCompact as EventCompactModern } from "../events/compact.modern";
import { EventsMap } from "../../components/events/map";
import { CompactPropose } from "../groups/CompactPropose";

/** A list of entities. */
export type ListOfEntitiesElementComponent<T> = React.FC<{
  entity: T;
  index: number;
  params: Record<string, string>;
}>;
export interface ListOfEntities<T> {
  route: string;
  showAll?: { text?: string } | false;
  filter: () => Filtering<any>;
  find: Publication<any[], T[]>;
  element: ListOfEntitiesElementComponent<T>;
}

/** A static component with entites eg. like eventMap */
export type ComponentWithEntitiesComponent<T> = React.FC<{
  entities: T[];
  params: Record<string, string>;
}>;
export interface ComponentWithEntities<T> {
  route: string;
  showAll?: { text?: string } | false | undefined;
  filter: () => Filtering<any>;
  find: Publication<any[], T[]>;
  component: ComponentWithEntitiesComponent<T>;
}

/** A static component eg. like propose */
export type StaticComponentComponent = React.FC<{
  params: Record<string, string>;
}>;
export interface StaticComponent {
  showAll?: { link?: string; text?: string } | false | undefined;
  component: StaticComponentComponent;
}

const group: ListOfEntities<GroupModel> = {
  route: "search",
  filter: GroupCollection.Filtering,
  find: Groups.useFindFilter,
  element: ({ entity, index, params }) => (
    <React.Fragment key={entity._id}>
      {/* The sevent box should allways be the propose one, after then every 21 */}
      {PublicSettings.feature.proposeGroupBox && (index - 6) % 21 === 0 && (
        <div className="me-2" style={{ inlineSize: "300px", minInlineSize: "300px" }}>
          <CompactPropose organization={params.organization} />
        </div>
      )}
      <div className="me-2" style={{ inlineSize: "300px", minInlineSize: "300px" }}>
        <GroupCompact group={entity} />
      </div>
    </React.Fragment>
  ),
};

const groupWithoutPropose: ListOfEntities<GroupModel> = {
  route: "search",
  filter: GroupCollection.Filtering,
  find: Groups.useFindFilter,
  element: ({ entity }) => (
    <div key={entity._id} className="me-2" style={{ inlineSize: "300px", minInlineSize: "300px" }}>
      <GroupCompact group={entity} />
    </div>
  ),
};

const event: ListOfEntities<EventModel> = {
  route: "calendar",
  showAll: { text: "dashboard.calendar.showAll" },
  filter: EventCollection.Filtering,
  find: Events.useFindFilter,
  element: ({ entity }) => (
    <div key={entity._id} className="me-2" style={{ inlineSize: "250px", minInlineSize: "250px" }}>
      <EventCompact event={entity} withDate={true} withImage={true} />
    </div>
  ),
};

const eventModern: ListOfEntities<EventModel> = {
  route: "calendar",
  showAll: { text: "dashboard.calendar.showAll" },
  filter: EventCollection.Filtering,
  find: Events.useFindFilter,
  element: ({ entity }) => <EventCompactModern event={entity} />,
};

const eventModernWithoutCategories: ListOfEntities<EventModel> = {
  route: "calendar",
  showAll: { text: "dashboard.calendar.showAll" },
  filter: EventCollection.Filtering,
  find: Events.useFindFilter,
  element: ({ entity }) => <EventCompactModern event={entity} hideCategories />,
};

function bodyStyle(imageUrl: string) {
  const src = imageUrl;
  if (!src) {
    return {};
  }

  return {
    backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.75)), url('${src}')`,
    backgroundPosition: "center",
    backgroundSize: "cover",
  };
}
const organization: ListOfEntities<OrganizationModel> = {
  route: "exploreOrganizations",
  filter: OrganizationCollection.Filtering,
  find: Organizations.useFindFilter,
  element: ({ entity }) => (
    <div key={entity._id} className="me-2">
      <div
        className="card card-organization border-0 rounded-0"
        style={bodyStyle(entity.publicLogoUrl())}
      >
        <div className="card-body">
          <h5 className="card-title">
            <a className="stretched-link" href={Router.path("organizationDetails", entity)}>
              {entity.name}
            </a>
          </h5>
          <p className="card-text">{entity.claim}</p>
        </div>
      </div>
    </div>
  ),
};

const eventsMap: ComponentWithEntities<EventModel> = {
  route: "eventsMap",
  showAll: false,
  filter: EventCollection.Filtering,
  find: Events.useFindFilter,
  component: ({ entities }) => (
    <div style={{ height: "440px" }}>
      <EventsMap events={entities} fullscreenControl />
    </div>
  ),
};

const propose: StaticComponent = {
  component: ({ params }) => (
    <div className="mw-md">
      <Edit {...params} />
    </div>
  ),
};

export const mapping = {
  group,
  groupWithoutPropose,
  event,
  eventModern,
  eventModernWithoutCategories,
  organization,
  eventsMap,
  propose,
} as const;
