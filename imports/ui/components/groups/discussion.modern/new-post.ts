import { GroupDiscussionEntity } from "/imports/api/group-discussions/group-discussions";
import { PickWithOptional } from "../../../../../types/type-utils";

export type NewPost = PickWithOptional<
  GroupDiscussionEntity,
  "_id" | "time_created" | "time_updated"
> & {
  new: true;
};

/**
 * Type guard to distinguish between draft posts and existing DB entities.
 *
 * This helps narrow types so we can catch edge cases.
 */
export function isNewPost(post: GroupDiscussionEntity | NewPost): post is NewPost {
  return "new" in post && post.new;
}
