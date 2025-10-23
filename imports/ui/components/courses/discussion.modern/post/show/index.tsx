import React from "react";
import moment from "moment";
import { useTranslation } from "react-i18next";

import { Courses } from "/imports/api/courses/courses";
import { CourseDiscussionEntity } from "/imports/api/course-discussions/course-discussions";
import * as CourseDiscussionsMethods from "/imports/api/course-discussions/methods";

import * as CourseDiscussionUtils from "/imports/utils/course-discussion-utils";
import * as Tooltips from "/imports/utils/Tooltips";
import { useUser } from "/imports/utils/react-meteor-data";

import { DiscussionProfileIcon } from "../profile-icon";
import { useDateTimeFormat } from "/imports/utils/react-moment-format";
import { RemoveDropdown } from "./remove-dropdown";
import { UserName } from "/imports/ui/components/UserName";

export interface Props {
  post: CourseDiscussionEntity & { new?: true } & { saving?: boolean };
  onEdit: () => void;
}

export function Show({ post, onEdit }: Props) {
  const { dateFormat, fromNow } = useDateTimeFormat();
  const user = useUser();
  const { t } = useTranslation();

  function mayEdit() {
    return CourseDiscussionUtils.mayEditPost(user ?? undefined, post);
  }
  function mayDelete() {
    const course = Courses.findOne(post.courseId);
    if (!course) {
      throw new Error("Unexpected falsy: course");
    }
    return CourseDiscussionUtils.mayDeletePost(user ?? undefined, course, post);
  }
  function hasBeenEdited() {
    return moment(post.time_updated).isAfter(post.time_created);
  }
  function removeDropdownAttr() {
    return {
      async onRemove() {
        Tooltips.hide();

        await CourseDiscussionsMethods.deleteComment(post._id);
      },
    };
  }

  function handleEditClick() {
    Tooltips.hide();
    onEdit();
  }

  return post.new ? (
    post.parentId ? (
      <div className="list-group-item ps-5">
        <button type="button" className="btn btn-secondary" onClick={handleEditClick}>
          {t("course.discussion.comment_answer", "Answer")}
        </button>
      </div>
    ) : (
      <button type="button" className="btn btn-secondary mb-3" onClick={handleEditClick}>
        {t("course.discussion.write_comment", "Write a comment")}
      </button>
    )
  ) : (
    <div
      className={`list-group-item d-flex align-items-start gap-3${post.parentId ? " ps-5" : ""}`}
    >
      <DiscussionProfileIcon userId={post.userId} />
      <div className="flex-grow-1">
        <div className="d-flex justify-content-between">
          <p>
            <strong>
              {post.userId ? (
                <UserName userId={post.userId} />
              ) : (
                t("discussion.anonymous", "Anonymous")
              )}
            </strong>{" "}
            <span data-bs-title={dateFormat(post.time_created)}>{fromNow(post.time_created)}</span>
            {!!post.notifyAll && (
              <>
                {" "}
                <i
                  className="fa-solid fa-bell"
                  aria-hidden="true"
                  data-bs-title={
                    !post.eventId
                      ? t("course.discussion.allNotified", "All interested notified")
                      : t(
                          "event.discussion.allNotified",
                          "All interested and participants notified",
                        )
                  }
                ></i>
              </>
            )}
            {hasBeenEdited() && (
              <>
                {" "}
                - {t("course.discussion.lastUpdate", "Last update")}:{" "}
                <span data-bs-title={dateFormat(post.time_updated)}>
                  {fromNow(post.time_updated)}
                </span>
              </>
            )}
          </p>
          <span>
            {mayEdit() && (
              <button type="button" className="discussion-edit-btn" onClick={handleEditClick}>
                <span className="fa-solid fa-pen-to-square" aria-hidden="true"></span>
              </button>
            )}
            {mayDelete() && <RemoveDropdown {...removeDropdownAttr()} />}
          </span>
        </div>
        {!!post.title && <h4>{post.title}</h4>}
        <p dangerouslySetInnerHTML={{ __html: post.text }}></p>
      </div>
    </div>
  );
}
