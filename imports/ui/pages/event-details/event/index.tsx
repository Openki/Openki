import React, { useState } from "react";
import { Router } from "meteor/iron:router";
import { useUser } from "/imports/utils/react-meteor-data";
import { useTranslation } from "react-i18next";
import { useParams } from "/imports/utils/react-meteor-router";

import { Courses } from "/imports/api/courses/courses";
import { EventModel } from "/imports/api/events/events";

import { ScssVars } from "/imports/ui/lib/scss-vars";
import * as Viewport from "/imports/ui/lib/viewport";

import { EventCourseHeader } from "/imports/ui/components/events/display/course-header";
import { Edit } from "/imports/ui/components/events/edit";
import { Display } from "/imports/ui/components/events/display/body";
import { Discussion } from "/imports/ui/components/courses/discussion";
import { EventRegistration } from "/imports/ui/components/events/display/registration";
import { Report } from "/imports/ui/components/report";

import "./styles.scss";

export function Event(data: { event: EventModel; new: boolean }) {
  const { event } = data;
  const { t } = useTranslation();
  const user = useUser();
  const [editing, setEditing] = useState(!event._id);
  const params = useParams();

  function mobileViewport() {
    return Viewport.get().width <= ScssVars.screenMD;
  }
  function select() {
    return params.select;
  }
  function courseLink() {
    if (!event.courseId) {
      return "";
    }
    const course = Courses.findOne({ _id: event.courseId });
    return Router.path(
      "showCourse",
      { _id: event.courseId },
      course?.singleEvent ? { query: { force: "1" } } : {},
    );
  }
  function course() {
    if (event.courseId) {
      return Courses.findOne(event.courseId);
    }
    return undefined;
  }
  function mayEdit() {
    if (!user) {
      return false;
    }
    return event.editableBy(user);
  }
  function isEditing() {
    return data.new || editing;
  }
  function eventEditAttr() {
    return {
      event,
      afterSave: () => {
        setEditing(false);
      },
      onCancel: () => {
        if (data.new) {
          window.history.back();
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
          <div className="alert alert-canceled text-center" role="alert">
            <strong>
              {t("event.canceled.alert", "{EVENT} got canceled.", { EVENT: event.title })}
            </strong>
          </div>
        )}

        {!!course() && (
          <>
            {!course().singleEvent ? (
              <EventCourseHeader
                backlink={courseLink()}
                headerlink={courseLink()}
                regionId={event.region}
                categories={event.categories}
                title={course().name}
                image={course().publicUrlForDetailsImage()}
              />
            ) : mayEdit() ? (
              <EventCourseHeader
                course={course()}
                backlink={courseLink()}
                regionId={event.region}
                categories={event.categories}
                title={event.title}
                image={course().publicUrlForDetailsImage()}
              />
            ) : (
              <EventCourseHeader
                course={course()}
                regionId={event.region}
                categories={event.categories}
                title={event.title}
                image={course().publicUrlForDetailsImage()}
              />
            )}
          </>
        )}

        <div className={`event${course() ? " course-event" : ""}`}>
          {isEditing() ? <Edit {...eventEditAttr()} /> : <Display {...eventDisplayAttr()} />}
        </div>
        {!mobileViewport() && !isEditing() && !!course().singleEvent && (
          <Discussion courseId={course()._id} eventId={event._id} select={select()} />
        )}
      </div>
      {!isEditing() && (
        <div className="col-lg-4">
          <EventRegistration event={event} />
          {mobileViewport() && !!course().singleEvent && (
            <Discussion courseId={course()._id} eventId={event._id} select={select()} />
          )}
          <div className="page-component mt-3">
            <Report />
          </div>
        </div>
      )}
    </div>
  );
}
