import React, { useState } from "react";
import { Router } from "meteor/iron:router";
import { useUser } from "/imports/utils/react-meteor-data";
import { useTranslation } from "react-i18next";
import { useParams, useSearchParams } from "/imports/utils/react-meteor-router";

import { EventModel } from "/imports/api/events/events";
import { useDetails } from "/imports/api/groups/publications";

import { ScssVars } from "/imports/ui/lib/scss-vars";
import { useViewportSize } from "/imports/ui/lib/useViewportSize";

import { EventGroupHeader } from "../../../components/events/display/group-header";
import { Edit } from "/imports/ui/components/events/edit";
import { Display } from "/imports/ui/components/events/display/body";
import { Discussion } from "../../../components/groups/discussion";
import { EventRegistration } from "/imports/ui/components/events/display/registration";
import { Report } from "/imports/ui/components/report";

import "./styles.scss";

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

function GroupEvent({ event }: { event: WithRequired<EventModel, "groupId"> }) {
  const [isLoading, group] = useDetails(event.groupId);

  const user = useUser();

  function groupLink() {
    return Router.path(
      "showGroup",
      { _id: event.groupId, slug: group?.slug },
      group?.singleEvent ? { query: { force: "1" } } : {},
    );
  }

  if (isLoading() || !group) {
    return null;
  }

  return (
    <>
      {!group.singleEvent ? (
        <EventGroupHeader
          backLink={groupLink()}
          headerLink={groupLink()}
          regionId={event.region}
          categories={event.categories}
          title={group.name}
          image={group.publicUrlForDetailsImage()}
        />
      ) : (
        <EventGroupHeader
          group={group}
          backLink={event.editableBy(user) ? groupLink() : undefined}
          regionId={event.region}
          categories={event.categories}
          title={event.title}
          image={group.publicUrlForDetailsImage()}
        />
      )}
    </>
  );
}

function DisplayDiscussion({ eventId, groupId }: { eventId: string; groupId: string }) {
  const [isLoading, group] = useDetails(groupId);
  const params = useParams();

  function select() {
    return params.select;
  }

  if (isLoading() || !group || !group.singleEvent) {
    return null;
  }

  return <Discussion groupId={group._id} eventId={eventId} select={select()} />;
}

export function Event({ event, isNew }: { event: EventModel; isNew: boolean }) {
  const { t } = useTranslation();
  const viewport = useViewportSize();
  const param = useSearchParams();
  const [editing, setEditing] = useState(isNew || param.edit === "1");

  function mobileViewport() {
    return viewport.width <= ScssVars.screenMD;
  }
  function isEditing() {
    return isNew || editing;
  }
  function eventEditAttr() {
    return {
      event,
      isNew: isNew,
      afterSave: () => {
        setEditing(false);
      },
      onCancel: () => {
        if (isNew) {
          history.back();
        } else {
          setEditing(false);
        }
      },
    };
  }
  function eventDisplayAttr() {
    return {
      event,
      onRemove: () => {
        setEditing(false);
      },
      onEdit: () => {
        setEditing(true);
      },
    };
  }

  return (
    <div className="row">
      <div className="col-lg-8 mb-3">
        {!!event.canceled && (
          <div
            data-test="event-details-canceled"
            className="alert alert-canceled text-center fw-bold"
            role="alert"
          >
            {t("event.canceled.alert", "{EVENT} got canceled.", { EVENT: event.title })}
          </div>
        )}

        {!!event.groupId && <GroupEvent event={event as WithRequired<EventModel, "groupId">} />}

        <div className={`event${event.groupId ? " group-event" : ""}`}>
          {isEditing() ? <Edit {...eventEditAttr()} /> : <Display {...eventDisplayAttr()} />}
        </div>
        {!mobileViewport() && !isEditing() && !!event.groupId && (
          <DisplayDiscussion groupId={event.groupId} eventId={event._id} />
        )}
      </div>
      {!isEditing() && (
        <div className="col-lg-4">
          <EventRegistration event={event} />
          {mobileViewport() && !!event.groupId && (
            <DisplayDiscussion groupId={event.groupId} eventId={event._id} />
          )}
          <div className="page-component mt-3">
            <Report showGroupHint />
          </div>
        </div>
      )}
    </div>
  );
}
