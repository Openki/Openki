import React from "react";
import { Filtering } from "/imports/utils/filtering";
import { Publication } from "/imports/utils/ServerPublishReact";

export type ListOfEntitiesElementComponent<T> = React.FC<{
  entity: T;
  index: number;
  params: Record<string, string>;
}>;
/** A list of entities. */
export interface ListOfEntities<T> {
  route: string;
  showAll?: { text?: string } | false;
  filter: () => Filtering<any>;
  find: Publication<any[], T[]>;
  element: ListOfEntitiesElementComponent<T>;
}

export type ComponentWithEntitiesComponent<T> = React.FC<{
  entities: T[];
  params: Record<string, string>;
}>;
/** A static component with entities eg. like eventMap */
export interface ComponentWithEntities<T> {
  route: string;
  showAll?: { text?: string } | false | undefined;
  filter: () => Filtering<any>;
  find: Publication<any[], T[]>;
  component: ComponentWithEntitiesComponent<T>;
}

export type StaticComponentComponent = React.FC<{
  params: Record<string, string>;
}>;
/** A static component eg. like propose */
export interface StaticComponent {
  showAll?: { link?: string; text?: string } | false | undefined;
  component: StaticComponentComponent;
}
