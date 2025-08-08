import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useUserId } from "/imports/utils/react-meteor-data";

import * as CourseDiscussions from "/imports/api/course-discussions/publications";

import { routerAutoscroll } from "/imports/ui/lib/router-autoscroll";

import { LoadingRow } from "/imports/ui/pages/loading";
import { Post } from "./post";

import "./styles.scss";

export interface Props {
  courseId: string;
  eventId?: string | undefined;
}

export function Discussion({ courseId, eventId }: Props) {
  const { t } = useTranslation();
  const userId = useUserId();
  // If we want to jump to a comment we don't fold the comments
  const [limit, setLimit] = useState(3);
  const [edit, setEdit] = useState(false);
  const [notifyAll, setNotifyAll] = useState(false);

  const [isLoading, posts] = CourseDiscussions.useForCourse(courseId);

  function allDiscussions() {
    return posts
      .filter((p) => !p.parentId)
      .sort((a, b) => b.time_created.valueOf() - a.time_created.valueOf());
  }

  function dicussions() {
    let filteredPosts = allDiscussions();

    if (limit) {
      filteredPosts = filteredPosts.slice(0, limit);
    }

    return filteredPosts;
  }

  function responses(discussionId: string) {
    return posts
      .filter((p) => p.parentId === discussionId)
      .sort((a, b) => a.time_created.valueOf() - b.time_created.valueOf());
  }
  function newPostAttr() {
    return {
      post: {
        new: true,
        courseId,
        eventId,
        userId,
        title: "",
        text: "",
        notifyAll,
      } as any,
      edit,
      onCancel: () => {
        setEdit(false);
        setNotifyAll(false);
      },
    };
  }
  function limited() {
    if (limit) {
      return allDiscussions().length > limit;
    }
    return false;
  }
  // style fixes a problem that occurs during the transition to react. This can be removed when everything is changed to react.
  return (
    <>
      <h4 className="card-title">{t("course.title.Discussion", "Discussion")}</h4>
      {isLoading() ? (
        <LoadingRow />
      ) : (
        <>
          <Post {...newPostAttr()} />
          {dicussions().map((post) => (
            <div className="list-group mb-3" key={post._id}>
              <Post post={post} responses={responses(post._id)} />
            </div>
          ))}
          {limited() && (
            <button
              className="btn btn-secondary mb-3"
              type="button"
              onClick={() => {
                setLimit(0);
              }}
            >
              <i className="fa-solid fa-chevron-down fa-fw" aria-hidden="true"></i>
              {t("course.discussions.showAllComment", "Show all {NUM} comments", {
                NUM: allDiscussions().length,
              })}
            </button>
          )}
        </>
      )}
    </>
  );
}

// for Blaze

import "./template.html";

Template.registerHelper("Discussion", () => Discussion);
