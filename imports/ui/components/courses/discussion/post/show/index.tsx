/* eslint-disable no-nested-ternary */
import React from "react";
import moment from "moment";
import { useTranslation } from "react-i18next";

import { Courses } from "/imports/api/courses/courses";
import { CourseDiscussionEntity } from "/imports/api/course-discussions/course-discussions";
import * as CourseDiscussionsMethods from "/imports/api/course-discussions/methods";
import * as Alert from "/imports/api/alerts/alert";

import * as CourseDiscussionUtils from "/imports/utils/course-discussion-utils";
import * as Tooltips from "/imports/utils/Tooltips";
import { useUser } from "/imports/utils/react-meteor-data";

import { DiscussionProfileIcon } from "../profile-icon";
import { DiscussionProfileLink } from "../profile-link";
import { useDateTimeFormat } from "/imports/utils/react-moment-format";
import { RemoveDropdown } from "./remove-dropdown";

export interface Props {
  post: CourseDiscussionEntity & { new?: true } & { saving?: boolean };
  onEdit: () => void;
}

export function Show({ post, onEdit }: Props) {
  const { dateFormat, fromNow } = useDateTimeFormat();
  const user = useUser();
  const { t } = useTranslation();

  function postClasses() {
    const classes = [];

    classes.push(post.parentId ? "discussion-comment" : "discussion-post");
    if (post.saving) {
      classes.push("is-saving");
    }

    return classes.join(" ");
  }
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

        try {
          await CourseDiscussionsMethods.deleteComment(post._id);
          Alert.success(t("discussionPost.deleted", "Comment deleted."));
        } catch (err) {
          Alert.serverError(err, t("discussionPost.deleted.error", "Could not delete comment"));
        }
      },
    };
  }

  function handleEditClick() {
    Tooltips.hide();
    onEdit();
  }

  return post.new ? (
    post.parentId ? (
      <div className="discussion-reply">
        <button
          type="button"
          className="btn btn-add discussion-reply-btn"
          onClick={handleEditClick}
        >
          {t("course.discussion.comment_answer", "Answer")}
        </button>
      </div>
    ) : (
      <button type="button" className="btn btn-add page-component-btn" onClick={handleEditClick}>
        <span className="fa-solid fa-pencil fa-fw" aria-hidden="true"></span>&nbsp;
        {t("course.discussion.write_comment", "Write a comment")}
      </button>
    )
  ) : (
    <div className={postClasses()} id={`comment${post._id}`}>
      <DiscussionProfileIcon userId={post.userId} />
      <div className="discussion-post-content">
        <div className="discussion-post-header">
          <DiscussionProfileLink userId={post.userId} />{" "}
          <span className="discussion-post-header-sub">
            <span data-bs-toggle="tooltip" data-bs-title={dateFormat(post.time_created)}>
              {fromNow(post.time_created)}
            </span>
            {!!post.notifyAll && (
              <>
                {" "}
                <i
                  className="fa-solid fa-bell"
                  aria-hidden="true"
                  data-bs-toggle="tooltip"
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
                <span data-bs-toggle="tooltip" data-bs-title={dateFormat(post.time_updated)}>
                  {fromNow(post.time_updated)}
                </span>
              </>
            )}
          </span>
          <span className="discussion-buttons">
            {mayEdit() && (
              <button type="button" className="discussion-edit-btn" onClick={handleEditClick}>
                <span className="fa-solid fa-pen-to-square" aria-hidden="true"></span>
              </button>
            )}
            {mayDelete() && <RemoveDropdown {...removeDropdownAttr()} />}
          </span>
        </div>
        <div className="discussion-post-body">
          {!!post.title && <h4 className="discussion-post-title">{post.title}</h4>}
          <p dangerouslySetInnerHTML={{ __html: post.text }}></p>
        </div>
      </div>
    </div>
  );
}
