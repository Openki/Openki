import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useUserId } from "/imports/ui/hooks/react-meteor-data";

import * as GroupDiscussions from "/imports/api/group-discussions/publications";

import { routerAutoscroll } from "/imports/ui/lib/router-autoscroll";
import { useEventListener } from "/imports/ui/hooks/useEventListener";

import { LoadingRow } from "/imports/ui/pages/loading";
import { Post, type Props as PostProps } from "./post";

import "./styles.scss";

export interface Props {
  select: string | undefined;
  groupId: string;
  eventId?: string | undefined;
}

export function Discussion({ select, groupId, eventId }: Props) {
  const { t } = useTranslation();
  const userId = useUserId();
  // If we want to jump to a comment we don't fold the comments
  const [limit, setLimit] = useState(select ? 0 : 3);
  const [edit, setEdit] = useState(false);
  const [notifyAll, setNotifyAll] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  const [isLoading, posts] = GroupDiscussions.useForGroup(groupId);

  function allDiscussions() {
    return posts
      .filter((p) => !p.parentId)
      .sort((a, b) => b.time_created.valueOf() - a.time_created.valueOf());
  }

  function discussions() {
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
        groupId,
        eventId,
        userId,
        title: "",
        text: "",
        notifyAll,
      } as PostProps["post"],
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

  useEventListener(elementRef, "notifyAll", () => {
    setEdit(true);
    setNotifyAll(true);
    window.location.hash = "#discussion";
    routerAutoscroll.scheduleScroll();
  });

  useEventListener(elementRef, "writeComment", () => {
    setEdit(true);
    window.location.hash = "#discussion";
    routerAutoscroll.scheduleScroll();
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
    <div className="page-component discussion mt-4" id="discussion" ref={elementRef}>
      <div className="page-component-header">
        <h4>{t("group.title.Discussion", "Discussion")}</h4>
      </div>

      {isLoading() ? (
        <LoadingRow />
      ) : (
        <>
          <Post {...newPostAttr()} />
          {discussions().map((post) => (
            <div key={post._id} className="discussion-conversation">
              <Post post={post} responses={responses(post._id)} />
            </div>
          ))}
          {limited() && (
            <button
              className="btn btn-add page-component-btn"
              type="button"
              onClick={() => setLimit(0)}
            >
              <i className="fa-solid fa-chevron-down fa-fw" />
              {t("group.discussions.showAllComment", "Show all {NUM} comments", {
                NUM: allDiscussions().length,
              })}
            </button>
          )}
        </>
      )}
    </div>
  );
}
