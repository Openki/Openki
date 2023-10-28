import React, { useState } from "react";
import { useUserId } from "/imports/utils/react-meteor-data";
import { useTranslation } from "react-i18next";

import { CourseDiscussionEnity } from "/imports/api/course-discussions/course-discussions";

import { Edit } from "./edit";
import { Show } from "./show";

import "./styles.scss";

function Responses({ responses: replies }: { responses: CourseDiscussionEnity[] }) {
  const { t } = useTranslation();
  const [limit, setLimit] = useState(2);

  function responses() {
    return limit ? replies.slice(-limit) : replies;
  }
  function notAllResponsesShown() {
    return limit && replies.length > limit;
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
        <Post key={response._id} post={response} />
      ))}
    </>
  );
}

export type Props = {
  post: CourseDiscussionEnity & { new?: true };
  responses?: CourseDiscussionEnity[];
  edit?: boolean;
  onCancel?: () => void;
};

export function Post({ post, responses, edit, onCancel }: Props) {
  const isParent = !post.new && !post.parentId;
  const [editing, setEditing] = useState(!!edit);
  const userId = useUserId();

  function newResponse() {
    return {
      new: true,
      parentId: post._id,
      courseId: post.courseId,
      userId,
      title: "",
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
          {responses ? <Responses responses={responses} /> : null}
          <Post post={newResponse() as any} />
        </>
      ) : null}
    </>
  );
}
