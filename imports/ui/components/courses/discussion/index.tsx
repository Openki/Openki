import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useUserId } from "/imports/utils/react-meteor-data";

import * as CourseDiscussions from "/imports/api/course-discussions/publications";

import { routerAutoscroll } from "/imports/ui/lib/router-autoscroll";

import { LoadingRow } from "/imports/ui/pages/loading";
import { Post } from "./post";

import "./styles.scss";

export type Props = { select: string; courseId: string };

export function Discussion({ select, courseId }: Props) {
  const { t } = useTranslation();
  const userId = useUserId();

  // If we want to jump to a comment we don't fold the comments
  const [limit, setLimit] = useState(select ? 0 : 3);
  const [edit, setEdit] = useState(false);
  const [notifyAll, setNotifyAll] = useState(false);

  const [isLoading, posts] = CourseDiscussions.useForCourse(courseId);

  function posts2() {
    let filteredPosts = posts
      .filter((p) => !p.parentId)
      .sort((a, b) => b.time_created.getMilliseconds() - a.time_created.getMilliseconds());

    if (limit) {
      filteredPosts = filteredPosts.slice(0, limit);
    }

    return filteredPosts;
  }
  function newPostAttr() {
    return {
      post: {
        new: true,
        courseId,
        userId,
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
      return posts2().length > limit;
    }
    return false;
  }

  useEffect(() => {
    document.getElementById("#discussion")?.addEventListener("notifyAll", () => {
      setEdit(true);
      setNotifyAll(true);
      window.location.hash = "#discussion";
      routerAutoscroll.scheduleScroll();
    });
    document.getElementById("#discussion")?.addEventListener("writeComment", () => {
      setEdit(true);
      window.location.hash = "#discussion";
      routerAutoscroll.scheduleScroll();
    });
  });

  useEffect(() => {
    // Jump to the selected comment.
    // This method should work for screenreaders too.
    window.location.hash = `#comment${select}`;
    routerAutoscroll.scheduleScroll();
  });

  // style fixes a problem that occurs during the transition to react. This can be removed when everything is changed to react.
  return (
    <div className="page-component discussion" id="discussion" style={{ marginTop: "15px" }}>
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
          {posts2().map((post) => (
            <div key={post._id} className="discussion-conversation">
              <Post post={post} />
            </div>
          ))}
          {limited() ? (
            <button
              className="btn btn-add page-component-btn js-show-all-posts"
              type="button"
              onClick={() => {
                setLimit(0);
              }}
            >
              <i className="fa-solid fa-chevron-down fa-fw" aria-hidden="true"></i>
              {t("course.discussions.showAllComment", "Show all {NUM} comments", {
                NUM: posts2().length,
              })}
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("Discussion", () => Discussion);
