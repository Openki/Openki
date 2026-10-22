import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useUserId } from "/imports/ui/hooks/react-meteor-data";

import * as GroupDiscussions from "/imports/api/group-discussions/publications";

import { LoadingRow } from "/imports/ui/pages/loading";
import { Post, type Props as PostProps } from "./post";

import "./styles.scss";

export interface Props {
  groupId: string;
  eventId?: string | undefined;
}

export function Discussion({ groupId, eventId }: Props) {
  const { t } = useTranslation();
  const userId = useUserId();
  // If we want to jump to a comment we don't fold the comments
  const [limit, setLimit] = useState(3);
  const [edit, setEdit] = useState(false);
  const [notifyAll, setNotifyAll] = useState(false);

  const [isLoading, posts] = GroupDiscussions.useForGroup(groupId);

  function allDiscussions() {
    return posts
      .filter((p) => !p.parentId)
      .toSorted((a, b) => b.time_created.valueOf() - a.time_created.valueOf());
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
      .toSorted((a, b) => a.time_created.valueOf() - b.time_created.valueOf());
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
  // style fixes a problem that occurs during the transition to react. This can be removed when everything is changed to react.
  return (
    <>
      <h4 className="card-title">{t("group.title.Discussion", "Discussion")}</h4>
      {isLoading() ? (
        <LoadingRow />
      ) : (
        <>
          <Post {...newPostAttr()} />
          {discussions().map((post) => (
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
              <i className="fa-solid fa-chevron-down fa-fw" />
              {t("group.discussions.showAllComment", "Show all {NUM} comments", {
                NUM: allDiscussions().length,
              })}
            </button>
          )}
        </>
      )}
    </>
  );
}
