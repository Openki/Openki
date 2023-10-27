import React, { useState } from "react";
import { useUserId } from "/imports/utils/react-meteor-data";
import { useTranslation } from "react-i18next";

import {
  CourseDiscussionEnity,
  CourseDiscussions,
} from "/imports/api/course-discussions/course-discussions";

import { Edit } from "./edit";
import { Show } from "./show";

import "./styles.scss";

function Responses({ post }: { post: CourseDiscussionEnity & { new?: true } }) {
  const { t } = useTranslation();
  const [limit, setLimit] = useState(2);

  function responses() {
    // Note that the 'discussion' subscription from the 'discussion' template
    // covers responses as well

    const replies = CourseDiscussions.find(
      { parentId: post._id },
      { sort: { time_created: 1 } },
    ).fetch();

    return limit ? replies.slice(-limit) : replies;
  }
  function notAllResponsesShown() {
    const count = CourseDiscussions.find({ parentId: post._id }, { limit: limit + 1 }).count();

    return limit && count > limit;
  }

  return (
    <>
      {notAllResponsesShown() ? (
        <button
          className="mt-3 btn btn-link p-0 toggle-all-responses"
          type="button"
          onClick={() => {
            setLimit(0);
          }}
        >
          {t("course.discussions.showPreviousReplies", "Show all previous answers")}
        </button>
      ) : null}
      {responses().map((response) => (
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        <Post post={response} />
      ))}
    </>
  );
}

export type Props = {
  post: CourseDiscussionEnity & { new?: true };
  edit?: boolean;
  onCancel?: () => void;
};

export function Post({ post, edit, onCancel }: Props) {
  const isParent = !post.new && !post.parentId;
  const [editing, setEditing] = useState(!!edit);
  const userId = useUserId();

  function newResponse() {
    return {
      new: true,
      parentId: post._id,
      courseId: post.courseId,
      userId,
      text: "",
    };
  }
  function postShowAttr() {
    return {
      post,
      onEdit: () => {
        setEditing(true);
      },
    };
  }
  function postEditAttr() {
    return {
      post,
      onSave: () => {
        setEditing(false);
      },
      onCancel: () => {
        setEditing(false);
        onCancel?.();
      },
    };
  }

  return (
    <>
      {editing ? <Edit {...postEditAttr()} /> : <Show {...postShowAttr()} />}

      {isParent ? (
        <>
          <Responses post={post} />
          <Post post={newResponse() as any} />
        </>
      ) : null}
    </>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("Post", () => Post);
