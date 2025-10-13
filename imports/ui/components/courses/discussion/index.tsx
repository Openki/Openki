import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useUserId } from "/imports/utils/react-meteor-data";

import * as CourseDiscussions from "/imports/api/course-discussions/publications";

import { routerAutoscroll } from "/imports/ui/lib/router-autoscroll";

import { LoadingRow } from "/imports/ui/pages/loading";
import { Post } from "./post";

import "./styles.scss";

export interface Props {
  select: string | undefined;
  courseId: string;
  eventId?: string | undefined;
}

export function Discussion({ select, courseId, eventId }: Props) {
  const { t } = useTranslation();
  const userId = useUserId();
  // If we want to jump to a comment we don't fold the comments
  const [limit, setLimit] = useState(select ? 0 : 3);
  const [edit, setEdit] = useState(false);
  const [notifyAll, setNotifyAll] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const element = elementRef.current;
    const handleNotifyAll = () => {
      setEdit(true);
      setNotifyAll(true);
      window.location.hash = "#discussion";
      routerAutoscroll.scheduleScroll();
    };
    element?.addEventListener("notifyAll", handleNotifyAll);

    const handleWriteComment = () => {
      setEdit(true);
      window.location.hash = "#discussion";
      routerAutoscroll.scheduleScroll();
    };
    element?.addEventListener("writeComment", handleWriteComment);

    return () => {
      element?.removeEventListener("notifyAll", handleNotifyAll);
      element?.removeEventListener("writeComment", handleWriteComment);
    };
  });

  useEffect(() => {
    if (!select) {
      return;
    }
    // Jump to the selected comment.
    // This method should work for screenreaders too.
    window.location.hash = `#comment${select}`;
    routerAutoscroll.scheduleScroll();
  });

  // style fixes a problem that occurs during the transition to react. This can be removed when everything is changed to react.
  return (
    <div
      className="page-component discussion"
      id="discussion"
      ref={elementRef}
      style={{ marginTop: "15px" }}
    >
      <div className="page-component-header">
        <h4>
          <span className="fa-solid fa-comments fa-fw" aria-hidden="true"></span>&nbsp;
          {t("course.title.Discussion", "Discussion")}
        </h4>
      </div>

      {isLoading() ? (
        <LoadingRow />
      ) : (
        <>
          <Post {...newPostAttr()} />
          {dicussions().map((post) => (
            <div key={post._id} className="discussion-conversation">
              <Post post={post} responses={responses(post._id)} />
            </div>
          ))}
          {limited() && (
            <button
              className="btn btn-add page-component-btn"
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
    </div>
  );
}
