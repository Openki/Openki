import React, { useState } from "react";
import { Router } from "meteor/iron:router";
import { useUser } from "/imports/utils/react-meteor-data";
import { useTranslation } from "react-i18next";
import { useParams, useSearchParams } from "/imports/utils/react-meteor-router";

import { EventModel } from "/imports/api/events/events";
import { useDetails } from "/imports/api/courses/publications";

import { ScssVars } from "/imports/ui/lib/scss-vars";
import * as Viewport from "/imports/ui/lib/viewport";

import { EventCourseHeader } from "/imports/ui/components/events/display/course-header";
import { Edit } from "/imports/ui/components/events/edit";
import { Display } from "/imports/ui/components/events/display/body";
import { Discussion } from "/imports/ui/components/courses/discussion";
import { EventRegistration } from "/imports/ui/components/events/display/registration";
import { Report } from "/imports/ui/components/report";

import "./styles.scss";

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

function CourseEvent({ event }: { event: WithRequired<EventModel, "courseId"> }) {
  const [isLoading, course] = useDetails(event.courseId);

  const user = useUser();

  function courseLink() {
    return Router.path(
      "showCourse",
      { _id: event.courseId, slug: course?.slug },
      course?.singleEvent ? { query: { force: "1" } } : {},
    );
  }

  if (isLoading() || !course) {
    return null;
  }

  return (
    <>
      {!course.singleEvent ? (
        <EventCourseHeader
          backlink={courseLink()}
          headerlink={courseLink()}
          regionId={event.region}
          categories={event.categories}
          title={course.name}
          image={course.publicUrlForDetailsImage()}
        />
      ) : (
        <EventCourseHeader
          course={course}
          backlink={event.editableBy(user) ? courseLink() : undefined}
          regionId={event.region}
          categories={event.categories}
          title={event.title}
          image={course.publicUrlForDetailsImage()}
        />
      )}
    </>
  );
}

function DisplayDiscussion({ eventId, courseId }: { eventId: string; courseId: string }) {
  const [isLoading, course] = useDetails(courseId);
  const params = useParams();

  function select() {
    return params.select;
  }

  if (isLoading() || !course || !course.singleEvent) {
    return null;
  }

  return <Discussion courseId={course._id} eventId={eventId} select={select()} />;
}

export function Event({ event, isNew }: { event: EventModel; isNew: boolean }) {
  const { t } = useTranslation();
  const param = useSearchParams();
  const [editing, setEditing] = useState(isNew || param.edit === "1");

  function mobileViewport() {
    return Viewport.get().width <= ScssVars.screenMD;
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
          <div data-test="event-details-canceled" className="alert alert-canceled text-center" role="alert">
            <strong>
              {t("event.canceled.alert", "{EVENT} got canceled.", { EVENT: event.title })}
            </strong>
          </div>
        )}

        {!!event.courseId && <CourseEvent event={event as WithRequired<EventModel, "courseId">} />}

        <div className={`event${event.courseId ? " course-event" : ""}`}>
          {isEditing() ? <Edit {...eventEditAttr()} /> : <Display {...eventDisplayAttr()} />}
        </div>
        {!mobileViewport() && !isEditing() && !!event.courseId && (
          <DisplayDiscussion courseId={event.courseId} eventId={event._id} />
        )}
      </div>
      {!isEditing() && (
        <div className="col-lg-4">
          <EventRegistration event={event} />
          {mobileViewport() && !!event.courseId && (
            <DisplayDiscussion courseId={event.courseId} eventId={event._id} />
          )}
          <div className="page-component mt-3">
            <Report />
          </div>
        </div>
      )}
    </div>
  );
}
