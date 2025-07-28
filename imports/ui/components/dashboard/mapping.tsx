/* eslint-disable no-nested-ternary */
import React from "react";
import { Router } from "meteor/iron:router";
import { PublicSettings } from "/imports/utils/PublicSettings";

import { Courses as CourseCollection, CourseModel } from "/imports/api/courses/courses";
import { Events as EventCollection, EventModel } from "/imports/api/events/events";
import { Groups as GroupCollection, GroupModel } from "/imports/api/groups/groups";
import * as Courses from "/imports/api/courses/publications";
import * as Events from "/imports/api/events/publications";
import * as Groups from "/imports/api/groups/publications";

import { Filtering } from "/imports/utils/filtering";
import { Publication } from "/imports/utils/ServerPublishReact";
import { CourseTemplate } from "../../lib/course-template";

import { Edit } from "../courses/edit";
import { CourseCompact } from "../courses/compact";
import { CompactPropose } from "/imports/ui/components/courses/compact-propose";
import { EventCompact } from "../events/compact";
import { EventsMap } from "../events/map";

/** A list of entites. */

export type ListOfEntitesElementComponent<T> = React.FC<{
  entity: T;
  index: number;
  params: Record<string, string>;
}>;
export interface ListOfEntities<T> {
  route: string;
  showAll?: { text?: string } | false;
  filter: () => Filtering<any>;
  find: Publication<any, T[]>;
  element: ListOfEntitesElementComponent<T>;
}

/** A static component with entites eg. like eventMap */
export type ComponentWithEntitesComponent<T> = React.FC<{
  entities: T[];
  params: Record<string, string>;
}>;
export interface ComponentWithEntities<T> {
  route: string;
  showAll?: { text?: string } | false;
  filter: () => Filtering<any>;
  find: Publication<any, T[]>;
  component: ComponentWithEntitesComponent<T>;
}

/** A static component eg. like propose */
export type StaticComponentComponent = React.FC<{
  params: Record<string, string>;
}>;
export interface StaticComponent {
  component: StaticComponentComponent;
}

const course: ListOfEntities<CourseModel> = {
  route: "search",
  filter: CourseCollection.Filtering,
  find: Courses.useFindFilter,
  element: ({ entity, index, params }) => (
    <React.Fragment key={entity._id}>
      {/* The sevent box should allways be the propose one, after then every 21 */}
      {PublicSettings.feature.proposeCourseBox && (index - 6) % 21 === 0 && (
        <div className="me-2" style={{ inlineSize: "300px", minInlineSize: "300px" }}>
          <CompactPropose group={params.group} />
        </div>
      )}
      <div className="me-2" style={{ inlineSize: "300px", minInlineSize: "300px" }}>
        <CourseCompact course={entity} />
      </div>
    </React.Fragment>
  ),
};

const courseWithoutPropose: ListOfEntities<CourseModel> = {
  route: "search",
  filter: CourseCollection.Filtering,
  find: Courses.useFindFilter,
  element: ({ entity }) => (
    <div key={entity._id} className="me-2" style={{ inlineSize: "300px", minInlineSize: "300px" }}>
      <CourseCompact course={entity} />
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
const group: ListOfEntities<GroupModel> = {
  route: "exploreGroups",
  filter: GroupCollection.Filtering,
  find: Groups.useFindFilter,
  element: ({ entity }) => (
    <div key={entity._id} className="me-2">
      <div className="card card-group border-0 rounded-0" style={bodyStyle(entity.publicLogoUrl())}>
        <div className="card-body">
          <h5 className="card-title">
            <a className="stretched-link" href={Router.path("groupDetails", entity)}>
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
      <EventsMap events={entities} openLinksInNewTab={false} />
    </div>
  ),
};

const propose: StaticComponent = {
  component: ({ params }) => (
    <div className="container mw-md">
      <Edit {...CourseTemplate()} {...params} />
    </div>
  ),
};

export const mapping = {
  course,
  courseWithoutPropose,
  event,
  group,
  eventsMap,
  propose,
} as const;
