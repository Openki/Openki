import { readFileSync, writeFileSync, createWriteStream, existsSync } from "node:fs";
import { join, resolve } from "node:path";

/**
 * This script was used for renaming issues and comments as part of
 * https://gitlab.com/Openki/Openki/-/work_items/2341
 *
 * This script can be used for two purposes:
 *
 * 1) Labeling GitLab issues based on local keyword search, followed by manual updates via the web UI.
 *    Useful for tricky cases with many edge cases and variations.
 *
 * 2) Automatically renaming issues and comments locally, reviewing manually, and then uploading the changes.
 *    Useful for repetetive keyword replacements with many occurences.
 *
 * To reuse this in the future, keywords probably need to change to your specific use-case.
 * But the code can be good inspiration - especially the logic around the `LOG_FILE`,
 * to keep track of which issues and notes (comments) that have already been updated.
 */

/**
 * The log file where to track already updated GitLab issues and notes (comments)
 * This file makes it possible to recover from any kind of errors (network, logic, API)
 * when making the API requests to update issues and comments.
 */
const LOG_FILE = resolve("./updated-issues-and-notes.txt");

/** Types genenrated from the GitLab API JSON responses */
export interface Issue {
  id: number;
  iid: number;
  project_id: number;
  title: string | null;
  description: string | null;
  state: string;
  created_at: Date;
  updated_at: Date;
  closed_at: null;
  closed_by: null;
  labels: string[];
  milestone: Milestone;
  assignees: any[];
  author: Author;
  type: string;
  assignee: null;
  user_notes_count: number;
  merge_requests_count: number;
  upvotes: number;
  downvotes: number;
  start_date: null;
  due_date: null;
  confidential: boolean;
  discussion_locked: null;
  issue_type: string;
  web_url: string;
  time_stats: TimeStats;
  task_completion_status: TaskCompletionStatus;
  weight: null;
  blocking_issues_count: number;
  has_tasks: boolean;
  task_status: string;
  _links: Links;
  references: References;
  severity: string;
  moved_to_id: null;
  imported: boolean;
  imported_from: string;
  service_desk_reply_to: null;
  epic_iid: number;
  epic: Epic;
  iteration: null;
  health_status: null;
}

export interface Links {
  self: string;
  notes: string;
  award_emoji: string;
  project: string;
  closed_as_duplicate_of: null;
}

export interface Author {
  id: number;
  username: string;
  public_email: string;
  name: string;
  state: string;
  locked: boolean;
  avatar_url: string;
  web_url: string;
}

export interface Epic {
  id: number;
  iid: number;
  title: string;
  url: string;
  group_id: number;
  human_readable_end_date: string;
  human_readable_timestamp: string;
}

export interface Milestone {
  id: number;
  iid: number;
  group_id: number;
  title: string;
  description: string;
  state: string;
  created_at: Date;
  updated_at: Date;
  due_date: Date;
  start_date: Date;
  expired: boolean;
  web_url: string;
}

export interface References {
  short: string;
  relative: string;
  full: string;
}

export interface TaskCompletionStatus {
  count: number;
  completed_count: number;
}

export interface TimeStats {
  time_estimate: number;
  total_time_spent: number;
  human_time_estimate: null;
  human_total_time_spent: null;
}

export interface Note {
  id: number;
  type: string;
  body: string;
  author: Author;
  created_at: Date;
  updated_at: Date;
  system: boolean;
  noteable_id: number;
  noteable_type: string;
  project_id: number;
  resolvable: boolean;
  resolved: boolean;
  resolved_by: null;
  resolved_at: null;
  confidential: boolean;
  internal: boolean;
  imported: boolean;
  imported_from: string;
  noteable_iid: number;
  commands_changes: CommandsChanges;
}

export interface Author {
  id: number;
  username: string;
  public_email: string;
  name: string;
  state: string;
  locked: boolean;
  avatar_url: string;
  web_url: string;
}

export interface CommandsChanges {}

type IssueWithNotes = Issue & {
  notes: Note[];
};

type MinimalNote = Pick<Note, "id" | "body"> & { author: Note["author"]["username"] };

type MinimalIssueWithNotes = Pick<
  IssueWithNotes,
  "iid" | "title" | "description" | "state" | "created_at"
> & {
  author: Issue["author"]["username"];
  notes?: MinimalNote[];
};

function loadEnv(ENV_VAR: string) {
  if (!process.env[ENV_VAR]) {
    throw new Error(`Missing environment variable ${ENV_VAR}`);
  }

  return process.env[ENV_VAR];
}

/**
 * A GitLab project access token created via for example:
 * https://gitlab.com/Openki/Openki/-/settings/access_tokens
 *
 * Create the token with minimal read + write API access,
 * and make sure to scope it only to the relevant project(s).
 *
 * NOTE: To update internal/confidential notes (comments),
 * the access level (GitLab role) `MAINTAINER` is needed.
 */
const GITLAB_API_TOKEN = loadEnv("GITLAB_API_TOKEN");

/**
 * API URL, scoped to the Openki/Openki GitLab project.
 *
 * GitLab API docs: https://docs.gitlab.com/api/issues/#list-all-issues
 */
const GITLAB_API_URL = "https://gitlab.com/api/v4/projects/7017332";

/**
 * ## The plan for the common cases (label issues on GitLab and manually update via the web UI)
 *
 * 1. search all comments for all issues for the search terms (KEYWORD_REPLACEMENTS)
 * 2. save unique issue `iid` that includes any of the search terms in the title, desc, or comments.
 * 3. Run the labeling script to add label (specific for this term renaming) to all affected issues
 * 4. manually make changes for all labeled issues in the gitlab web UI
 * 5. Verify by running the search script and see if it still finds any matches (maybe)
 * 6. Repeat for all terms. Remember to follow the order.
 */

/**
 * Download all issues and their related comments.
 *
 * Calling this function is the first step when locally updating issues and notes.
 * It's also a good idea to call this after each update, whether you add labels and manually update
 * or auto-rename via a script.
 */
async function downloadIssuesAndLabels() {
  const issues = await downloadIssues("all-issues.json");
  await downloadNotes("issues-with-notes.json", issues);
}

async function fetchIssues(queryParams: Record<string, string>) {
  const url = `${GITLAB_API_URL}/issues?${new URLSearchParams(queryParams).toString()}`;
  console.log("Fetching: ", url);

  return fetch(url, {
    headers: {
      Authorization: `Bearer ${GITLAB_API_TOKEN}`,
    },
  })
    .then((res) => res.json() as unknown as Issue[])
    .catch((err) => {
      console.error(err);
      return [] as Issue[];
    });
}

async function downloadIssues(outputFilename: string /*, searchTerm?: string */) {
  const issuesFilePath = join(import.meta.dirname, outputFilename);

  let page = 1;
  let issues: Issue[];
  let combined: Issue[] = [];
  const maxPerPage = 100;

  do {
    issues = await fetchIssues({
      /** Search for specific term */
      // search: searchTerm,
      /** Include all issues no matter who created them */
      scope: "all",
      // Search for both open and closed issues
      state: "all",
      per_page: maxPerPage.toString(),
      page: page.toString(),
    });

    combined = [...combined, ...issues];

    page++;
  } while (issues.length >= maxPerPage);

  console.log("Saving issues...", {
    total: combined.length,
    unique: new Set(combined.map(({ iid }) => iid)).size,
  });

  writeFileSync(issuesFilePath, JSON.stringify(combined, null, 2), "utf-8");

  return combined;
}

async function fetchNotes(issue_iid: number, queryParams: Record<string, string>) {
  const url = `${GITLAB_API_URL}/issues/${issue_iid}/notes?${new URLSearchParams(queryParams).toString()}`;
  console.log("Fetching notes for: ", url);
  // GET /projects/:id/issues/:issue_iid/notes?activity_filter=only_comments
  return fetch(url, {
    headers: {
      "PRIVATE-TOKEN": GITLAB_API_TOKEN,
    },
  })
    .then((res) => res.json() as unknown as Note[])
    .catch((err) => {
      console.error(err);
      return [] as Note[];
    });
}

/**
 * Combine issues with their notes (comments) and save to the outputFile.
 */
async function downloadNotes(outputFilename: string, issues: Issue[]) {
  const notesFilePath = join(import.meta.dirname, outputFilename);
  const issuesWithNotes: IssueWithNotes[] = [];
  const maxPerPage = 100;

  for (const issue of issues) {
    let page = 1;
    let notes: Note[] = [];
    let combined: Note[] = [];

    do {
      notes = await fetchNotes(issue.iid, {
        activity_filter: "only_comments",
        per_page: maxPerPage.toString(),
        page: page.toString(),
      });

      combined = [...combined, ...notes];

      page++;
    } while (notes.length >= maxPerPage);

    issuesWithNotes.push({
      ...issue,
      notes: combined,
    });
  }

  console.log("Saving issues with notes in", notesFilePath);

  writeFileSync(notesFilePath, JSON.stringify(issuesWithNotes, null, 2), "utf-8");
}

/**
 * Perform a local search of the issues and notes (comments) to find the ones matching
 * a specific keyword.
 *
 * Custom regexes or test functions can also be used to customize the matching behavior.
 */
function getIssuesWithMatchingKeyword(keyword: keyof typeof KEYWORD_REPLACEMENTS) {
  const issues = loadIssuesWithNotes();

  const matches = {
    title: new Set<Issue["iid"]>(),
    description: new Set<Issue["iid"]>(),
    notes: new Set<{ issue_iid: Issue["iid"]; note_id: Note["id"] }>(),
  };

  /** Custom regexes or test functions can be used to get more control over the matching behavior */
  const customMatcher: Partial<
    Record<
      keyof typeof KEYWORD_REPLACEMENTS,
      RegExp | { test: (stringToSearch: string) => boolean }
    >
  > = {
    orga: {
      test(s) {
        /*
         TEST CASE:

         No description, No Roles, No OrgaTeamMembers, Creator would only be participant
         groupOrganizers` (in db)\n</td>\n<td>\n\n`teamOrganizations`\n</td>\n<td></td>\n<td>would be nice if there is consistency for db, code, queries, and UI</td>\n</tr>\n<tr>\n<td>\n\n`?addTeamGroups=`\n\n`?teamGroups=` (query filter not existing yet)\n</td>\n<td>\n\n`?addTeamOrganizations=` (query)\n</td>\n<td></td>\n<td>\n\nin future maybe `?addAdminOrganizations=

         call it \"ability\" in context of self-organization

         Send message to everyone as orgaGroupMember ist the most important/urgent task here
         */
        return /orgateam|teamorga|orga-|-orga|orgag/i.test(s) && !/self-orga/i.test(s);
      },
    },
    // Since we already checked the lowercase "organisation" and "organization",
    // we only check the capitalised versions now.
    organisation: {
      test(s) {
        return s.includes("Organisation");
      },
    },
    // Since we already checked the lowercase "organisation" and "organization",
    // we only check the capitalised versions now.
    organization: {
      test(s) {
        return s.includes("Organization");
      },
    },
  };

  const keywordMatcher = customMatcher[keyword] ? customMatcher[keyword] : new RegExp(keyword, "i");

  for (const issue of issues) {
    if (keywordMatcher.test(issue.title ?? "") && !LABELING_EXCLUDED_ISSUE_IIDS.has(issue.iid)) {
      matches.title.add(issue.iid);
    }

    if (
      keywordMatcher.test(issue.description ?? "") &&
      !LABELING_EXCLUDED_ISSUE_IIDS.has(issue.iid)
    ) {
      matches.description.add(issue.iid);
    }

    for (const note of issue.notes ?? []) {
      if (keywordMatcher.test(note.body) && !LABELING_EXCLUDED_ISSUE_IIDS.has(issue.iid)) {
        matches.notes.add({ issue_iid: issue.iid, note_id: note.id });
      }
    }
  }

  return {
    unique: new Set([
      ...matches.title,
      ...matches.description,
      ...matches.notes.values().map((match) => match.issue_iid),
    ]),
    ...matches,
  };
}

async function addLabelToIssue(issue_iid: number, queryParams: Record<string, string>) {
  const url = `${GITLAB_API_URL}/issues/${issue_iid}?${new URLSearchParams(queryParams).toString()}`;
  console.log("Adding label for: ", url);
  return fetch(url, {
    headers: { "PRIVATE-TOKEN": GITLAB_API_TOKEN },
    method: "PUT",
  })
    .then((res) => res.json() as unknown as Issue)
    .catch((err) => {
      console.error(err);
    });
}

/**
 * Add GitLab lables to issues where the title, description or any comment matches a given keyword.
 * These labels can be useful to make it easy to find the issues that need manual review and updates.
 *
 * However, for larger amounts of issues, it's likely better to automatically rename keywords.
 */
async function addLabelsToIssues(
  keyword: keyof typeof KEYWORD_REPLACEMENTS,
  options?: { dryRun: boolean },
) {
  const issues = loadIssuesWithNotes();

  const matches = getIssuesWithMatchingKeyword(keyword);
  const label = `rename:${keyword}-to-${KEYWORD_REPLACEMENTS[keyword]}`;

  console.log(`${options?.dryRun ? "(Dry run) - " : ""}Adding labels for "${keyword}":`, matches);
  if (options?.dryRun) {
    return;
  }

  for (const issue of issues) {
    if (matches.unique.has(issue.iid)) {
      console.log(issue.iid, label);
      await addLabelToIssue(issue.iid, {
        add_labels: label,
      });
    }
  }
}

/**
 * These issues include false positives and should not be labeled
 */
const LABELING_EXCLUDED_ISSUE_IIDS = new Set([
  70, // Original renaming of terms - important context
  2341, // this is called "how to rename with fuzzy search" - important context
  1327, // Support ticket
]);

/** The main file storing issues and notes */
const ISSUES_FILE_PATH = join(import.meta.dirname, "issues-with-notes.json");

/*
 * Try reading the existing issues, and if it fails, crash early.
 */
function loadIssuesWithNotes(): IssueWithNotes[] {
  return JSON.parse(readFileSync(ISSUES_FILE_PATH, "utf-8"));
}

/**
 * Mapping of renamed terms with the format:
 * "old": "new"
 *
 * IMPORTANT: These are ordered and should be renamed in sequence to avoid problems.
 */
const KEYWORD_REPLACEMENTS = {
  organisation: "tenant", // rename:organisation-to-tenant
  organization: "tenant", // rename:organization-to-tenant
  team: "coordination-team", // rename:team-to-coordination-team
  // By using the singular form, we also catch the plural form
  organizer: "coordination-team", // rename:organizer-to-coordination-team
  organiser: "coordination-team", // rename:organiser-to-coordination-team
  //
  // Important to do "orga" after "organizer" and "organiser" in order to prevent conflicts
  orga: "coordination-team", // rename:orga-to-coordination-team
  group: "organization", // rename:group-to-organization
  // Important to do "course" after "group" to prevent conflicts
  course: "group", // rename:course-to-group
} as const;

/**
 * Clean up unwanted properties to make it easier to manually edit the file
 * with find and replace easier in the editor.
 */
function createMinimalIssuesAndNotesFile() {
  const issues = loadIssuesWithNotes();

  const updated: MinimalIssueWithNotes[] = issues.map(
    ({ iid, title, description, created_at, author: { username }, state, notes }) => {
      const minimalNotes = notes.map(({ id, body, created_at, author: { username } }) => {
        return {
          id,
          body,
          created_at,
          author: username,
        };
      });
      return {
        iid,
        title,
        description,
        created_at,
        author: username,
        state,
        ...(minimalNotes.length ? { notes: minimalNotes } : {}),
      };
    },
  );

  const path = join(import.meta.dirname, "minimal-issues-with-notes.json");
  console.log(`Writing minimal issues and note to ${path}`);
  console.log(`Next step: Create a copy of this file called "${MANUALLY_RENAMED_ISSUES_AND_NOTES_FILE}" and manually prefix the keywords you want to EXCLUDE from the automatic renaming with the zero-width space (invisible unicode symbol).
    This will enable the automatic renaming for all other instances of the keywords.`);

  console.log(
    `When done, use the ${autoRenameIssuesAndNotes.name}() function to rename the keywords`,
  );

  writeFileSync(path, JSON.stringify(updated, null, 2), "utf-8");
}

/**
 * This file contains the manual updates where keywords that should be EXCLUDED from
 * the auto-renaming have been prefix edge cases with a zero-width space: "​"
 */
const MANUALLY_RENAMED_ISSUES_AND_NOTES_FILE = join(
  import.meta.dirname,
  "manually-updated-issues-with-notes.json",
);

/**
 * This file containes the combined changes after both:
 * 1) the manual updates
 * 2) and the automatic renaming
 */
const AUTO_RENAMED_ISSUES_AND_NOTES_FILE = join(
  import.meta.dirname,
  "renamed-issues-with-notes.json",
);

function loadManuallyRenamedIssuesWithNotes(): MinimalIssueWithNotes[] {
  return JSON.parse(readFileSync(MANUALLY_RENAMED_ISSUES_AND_NOTES_FILE, "utf-8"));
}

function loadAutoRenamedIssuesWithNotes(): MinimalIssueWithNotes[] {
  return JSON.parse(readFileSync(AUTO_RENAMED_ISSUES_AND_NOTES_FILE, "utf-8"));
}

function renameGroupToOrganization(issues: MinimalIssueWithNotes[]) {
  function renameStrings(s: string) {
    return (
      s
        // Preserve the invisible spaces
        .replaceAll("​group", "​G_IG-1")
        .replaceAll("​Group", "​G_IG-2")
        // Make actual changes
        .replaceAll("group", "organization")
        .replaceAll("Group", "Organization")
        // Restore the invisible spaces
        .replaceAll("​G_IG-1", "​group")
        .replaceAll("​G_IG-2", "​Group")
    );
  }

  return issues.map((issue) => {
    if (GROUP_RENAMING_EXCLUDED_ISSUE_IIDS.has(issue.iid)) return issue;
    return {
      ...issue,
      title: renameStrings(issue.title ?? ""),
      description: renameStrings(issue.description ?? ""),
      ...(issue.notes?.length
        ? {
            notes: issue.notes.map((note) => {
              return {
                ...note,
                body: renameStrings(note.body),
              };
            }),
          }
        : {}),
    };
  });
}

function renameCourseToGroup(issues: MinimalIssueWithNotes[]) {
  function renameStrings(s: string) {
    return (
      s
        // Preserve the invisible spaces
        .replaceAll("​course", "​G_IG-1")
        .replaceAll("​Course", "​G_IG-2")
        // Make actual changes
        .replaceAll("course", "group")
        .replaceAll("Course", "Group")
        // Restore the invisible spaces
        .replaceAll("​G_IG-1", "​course")
        .replaceAll("​G_IG-2", "​Course")
    );
  }

  return issues.map((issue) => {
    if (COURSE_RENAMING_EXCLUDED_ISSUE_IIDS.has(issue.iid)) return issue;
    return {
      ...issue,
      title: renameStrings(issue.title ?? ""),
      description: renameStrings(issue.description ?? ""),
      ...(issue.notes?.length
        ? {
            notes: issue.notes.map((note) => {
              return {
                ...note,
                body: renameStrings(note.body),
              };
            }),
          }
        : {}),
    };
  });
}

/**
 * Perform automatic renaming of issues and notes for "group" and "course" which have too many matches for making manual changes.
 */
function autoRenameIssuesAndNotes() {
  const issues = loadManuallyRenamedIssuesWithNotes();
  let updatedIssuesAndNotes = renameGroupToOrganization(issues);
  const diffAfterGroupToOrganization = getDiffAfterRenamingIssuesAndNotes(
    updatedIssuesAndNotes,
    true,
  );

  // NOTE: Very important to rename group to organization
  // before renaming course to group to avoid conflicts.
  updatedIssuesAndNotes = renameCourseToGroup(updatedIssuesAndNotes);
  const combinedDiff = getDiffAfterRenamingIssuesAndNotes(updatedIssuesAndNotes, true);

  console.log("Additional changes after course to group renaming:");
  console.dir({
    issues: combinedDiff.updatedIssues.length - diffAfterGroupToOrganization.updatedIssues.length,
    notes: combinedDiff.updatedNotes.length - diffAfterGroupToOrganization.updatedNotes.length,
  });

  // These issue_iids should not be updated automatically, so if they have manual changes, warn about them
  const excludedIssuesWithManualChanges = new Set(
    combinedDiff.updatedIssues.map((issue) => issue.iid),
  );
  const excludedIssueCommentsWithManualChanges = new Set(
    combinedDiff.updatedNotes.map((note) => note.issue_iid),
  );

  const issuesToWarnAbout = GROUP_RENAMING_EXCLUDED_ISSUE_IIDS.union(
    COURSE_RENAMING_EXCLUDED_ISSUE_IIDS,
  ).intersection(excludedIssuesWithManualChanges.union(excludedIssueCommentsWithManualChanges));

  if (issuesToWarnAbout.size > 0) {
    console.warn(
      "\nWARNING: These issue_iids were ignored for automated updates, but still have manual updates:",
    );
    console.warn(issuesToWarnAbout);
  }

  writeFileSync(
    AUTO_RENAMED_ISSUES_AND_NOTES_FILE,
    JSON.stringify(updatedIssuesAndNotes, null, 2),
    "utf-8",
  );
}

type UpdatedNote = MinimalNote & { issue_iid: Issue["iid"] };

function getDiffAfterRenamingIssuesAndNotes(
  afterIssues: MinimalIssueWithNotes[],
  printDiff = false,
) {
  const beforeIssues = loadIssuesWithNotes();

  const updatedIssues: MinimalIssueWithNotes[] = [];
  const updatedNotes: UpdatedNote[] = [];

  for (const after of afterIssues) {
    const before = beforeIssues.find((i) => i.iid === after.iid);
    if (!before) {
      throw new Error(`issue (after) ${after.iid} does not exist in the issues before the updates`);
    }

    if (after.title !== before.title || after.description !== before.description) {
      updatedIssues.push(after);
    }

    for (const noteAfter of after.notes ?? []) {
      const noteBefore = (before.notes ?? []).find((n) => n.id === noteAfter.id);
      if (!noteBefore) {
        throw new Error(
          `Note (after) ${noteAfter.id} was not found before the updates! before.notes: ${before.notes}`,
        );
      }

      if (noteAfter.body !== noteBefore.body) {
        if (noteBefore.noteable_type.toLowerCase().trim() !== "issue") {
          throw new Error("Unsupported noteable_type: " + noteBefore.noteable_type);
        }
        updatedNotes.push({ ...noteAfter, issue_iid: noteBefore.noteable_iid });
      }
    }
  }

  if (printDiff) {
    console.log("Diff after renaming issues and notes (comments):");
    console.dir({
      updatedIssues: new Set(updatedIssues.map((issue) => issue.iid)),
      updatedNotes: new Set(updatedNotes.map((note) => note.id)),
    });
  }

  return { updatedIssues, updatedNotes };
}

const GROUP_RENAMING_EXCLUDED_ISSUE_IIDS = new Set([
  2386, // uses new terms already
  2385, // uses new terms already
  2354, // uses new terms already
  2341, // instructions for how to do renaming - important context
  1917, // ignore link with group in the URL.
  1809, // dump of log and error description, should not be renamed. Maybe it never happens again.
  1544, // reason: image link with `group` string inside
  1428, // group is already what we mean it to be in future
  1328, // link in description would break (edited manually other apperance of "group"
  885, // is about renaming of courses
  576, // reason: link inside, others done manually
  510, // reason: link in coment
  405, // reason: needs to be done manually (and in all its comments)
  70, // original renaming of terms - important context
  26, // reason: link in a comment
]);

const COURSE_RENAMING_EXCLUDED_ISSUE_IIDS = new Set([
  2386, // uses new terms already
  2385, // uses new terms already
  2354, // uses new terms already
  2341, // instructions for how to do renaming - important context
  885, // is about renaming of courses
  405, // reason: needs to be done manually (and in all its comments)
  70, // original renaming of terms - important context
]);

/**
 * ## Plan for renaming "group" to "organization" (and "course" to "group")
 *
 * remove unwanted properties
 * find and replace to mark edge cases with a special prefix - the zero-width space: "​"
 * replace other matches via script
 * save result to new output file
 *    --> skip: remove the marked edge cases to reduce noise in the diff
 *    --> skip: save to another output file
 *
 * Calculate the diff
 * For issues, make sure the `confidential` and `internal` status doesn't change when updating via the API
 * For issues, make sure the `labels` are not affected
 * For notes, Make sure the `confidential` and `internal` status of issues doesn't change when updating via the API
 *
 * Test with dry-runs outputting to a file. The URL with params for each update
 *
 * Make a commit with manual updates before the group auto-renaming
 * Auto-rename group to organization
 * After group auto-renaming, verify the output file
 * Commit the output file when it's all good
 *
 * Auto-rename course to group
 * make sure some issues are excluded when auto-renaming course to group
 * After course auto-renaming, verify the ooutput file
 * Commit the output file when it's all good
 *
 * get diff for all combined manual and automated updates
 * Warn if any of the excluded issues are part of the diff
 * Check the diff for renamed-issues-with-notes.json - it looks good!
 *
 * Decide if we should exclude some issues from the update. Likely not, but double check to be sure.
 *
 *
 * Test run with one issue and its comments - 2391, top of the
 * renamed-issues-with-notes.json
 * Verify the log output
 * Verify the issue and comments via the GitLab web UI
 *
 * Test run with 3 issues and their comments
 *    Verify the log output
 *    Verify the issue and comments via the GitLab web UI
 *
 * Run with all 1266 issues and their comments
 *    Verify the log output
 *    Verify the issue and comments via the GitLab web UI
 */

/**
 * Parse a log file from previous runs to make sure issues are only updated once.
 *
 * ## Format of the log file
 *
 * Each line contains the type of entry,
 * and the GitLab `iid` for the issue or note (comment):
 *
 * [type] [iid]
 *
 * ```txt
 * issue 221
 * note 35
 * note 49
 * issue 164
 * note 12
 * ```
 *
 * By only adding entries to this file after they have been successfully updated, we can
 * run the script multiple times without overwriting anything that has already been updated.
 *
 * @param path Path to the log file.
 * @returns Two sets with the already updated issues and notes.
 */
function parseAlreadyUpdatedFromLogFile(path: string) {
  const log = existsSync(path) ? readFileSync(path, "utf-8").trim() : "";

  const alreadyUpdated = {
    issues: new Set<Issue["iid"]>(),
    notes: new Set<Note["id"]>(),
  };

  if (log.length) {
    for (const line of log.split("\n")) {
      const entry = line.split(" ");
      if (entry.length !== 2) {
        throw new Error("Invalid log entry: " + entry);
      }

      const [type, iid] = entry;

      if (type === "issue") {
        alreadyUpdated.issues.add(parseInt(iid, 10));
      } else if (type === "note") {
        alreadyUpdated.notes.add(parseInt(iid, 10));
      } else {
        throw new Error("Invalid log entry type: " + type);
      }
    }
  }

  return alreadyUpdated;
}

async function updateIssue(
  issue_iid: number,
  queryParams: { title?: string; description?: string },
  appendToLog: (issue_iid: number) => void,
) {
  const url = `${GITLAB_API_URL}/issues/${issue_iid}?${new URLSearchParams(queryParams).toString()}`;
  console.log("Updating issue", issue_iid);
  const res = await fetch(url, {
    headers: { "PRIVATE-TOKEN": GITLAB_API_TOKEN },
    method: "PUT",
  });

  if (res.ok) {
    appendToLog(issue_iid);
    return res.json() as unknown as Issue;
  }

  throw new Error("Failed to update issue " + issue_iid, { cause: await res.text() });
}

async function updateNote(
  issue_iid: number,
  note_id: number,
  queryParams: { body: string },
  appendToLog: (note_id: number) => void,
) {
  const url = `${GITLAB_API_URL}/issues/${issue_iid}/notes/${note_id}?${new URLSearchParams(queryParams).toString()}`;
  // PUT /projects/:id/issues/:issue_iid/notes/:note_id
  console.log("Updating note", note_id);
  const res = await fetch(url, {
    headers: { "PRIVATE-TOKEN": GITLAB_API_TOKEN },
    method: "PUT",
  });

  if (res.ok) {
    appendToLog(note_id);
    return res.json() as unknown as Note;
  }

  throw new Error("Failed to update note " + note_id, { cause: await res.text() });
}

/**
 * This function performs idempotent updates of the provided issues and notes (comments).
 * By using a log file to record which issues and notes have already been updated,
 * we only update each issue and note once.
 *
 * The log file enables features we want:
 * 1. Partial updates (e.g. for only a subset of the issues and notes).
 * 2. Fault tolerance, including the ability to easily recover from network failures,
 *    API request failures and even logic errors in our code.
 *
 * Only the items not already in the log file will be updated.
 */
async function updateIssuesAndNotesFromDiff(
  { updatedIssues, updatedNotes }: ReturnType<typeof getDiffAfterRenamingIssuesAndNotes>,
  { dryRun }: { dryRun: boolean },
) {
  /**
   * Read the previously updated issues from the log file.
   * This ensures we only update each issue once.
   */
  const alreadyUpdated = parseAlreadyUpdatedFromLogFile(LOG_FILE);

  if (dryRun) {
    console.log("(DRY RUN) - Updating issues and notes...");
  }

  console.log("Already updated from previous runs:");
  console.dir(alreadyUpdated);

  // Open the log file with append-mode ("a"),
  // create it if it doesn't already exist (by using "a+")
  const logStream = createWriteStream(LOG_FILE, { flags: "a+" });

  function appendToLog(type: "issue" | "note", iid: number) {
    logStream.write(`${type} ${iid}\n`);
  }

  const appendIssueToLog = appendToLog.bind(null, "issue");
  const appendNoteToLog = appendToLog.bind(null, "note");

  try {
    for (const issue of updatedIssues) {
      const issueChanges = {
        ...(issue.title ? { title: issue.title } : {}),
        ...(issue.description ? { description: issue.description } : {}),
      };

      // Only update issue fields if they exist to prevent accidental deletions
      // if for example `null` is passed to the API.
      if (Object.keys(issueChanges).length) {
        // Skip updating issues if they exist in the log file.
        if (!alreadyUpdated.issues.has(issue.iid)) {
          if (dryRun) {
            await Promise.resolve();
            appendIssueToLog(issue.iid);
          } else {
            await updateIssue(issue.iid, issueChanges, appendIssueToLog);
          }
        } else {
          console.log("Skipping issue", issue.iid, "because it was already updated");
        }
      } else {
        console.log("Skipping issue", issue.iid, "because there are no changes");
      }

      for (const note of issue.notes ?? []) {
        if (!note.body) {
          console.log("Skipping note", note.id, "because the body is empty/missing");
          continue;
        }

        // Skip notes that have no changes
        if (!updatedNotes.some((n) => n.id === note.id)) {
          continue;
        }

        // Skip updating notes if they exist in the log file.
        if (!alreadyUpdated.notes.has(note.id)) {
          if (dryRun) {
            await Promise.resolve();
            appendNoteToLog(issue.iid);
          } else {
            await updateNote(issue.iid, note.id, { body: note.body }, appendNoteToLog);
          }
        } else {
          console.log("Skipping note", note.id, "because it was already updated");
        }
      }
    }

    console.log("\n\nAll issues and comments have been updated!\n\n");
  } catch (error) {
    // Catch all errors to be able to exit gracefully
    console.error("Aborting due to error:", error);
  } finally {
    // IMPORTANT: No matter if we exit due to errors or after completing all the updates,
    // we close the log file to properly save the results.
    logStream.end();
  }
}

async function main() {
  // await downloadIssuesAndLabels();
  // createMinimalIssuesAndNotesFile();
  //
  // autoRenameIssuesAndNotes();

  const allUpdates = loadAutoRenamedIssuesWithNotes();
  const diff = getDiffAfterRenamingIssuesAndNotes(allUpdates);

  /**
   * To easily verify changes, it's recommended to only update a subset at a time,
   * increasing the number over time.
   */
  const maxUpdates = 100;
  const updatedIssues = diff.updatedIssues.reverse().slice(0, maxUpdates);
  const updatedNotes = diff.updatedNotes.filter((note) =>
    updatedIssues.some((issue) => issue.notes && issue.notes.some((n) => note.id === n.id)),
  );

  console.dir({
    issuesToUpdate: new Set(updatedIssues.map((issue) => issue.iid)),
    notesToUpdate: new Set(updatedNotes.map((note) => note.id)),
  });

  console.log(
    "total diff: issues",
    diff.updatedIssues.length,
    "comments",
    diff.updatedNotes.length,
  );

  await updateIssuesAndNotesFromDiff({ updatedIssues, updatedNotes }, { dryRun: true });
}

await main();
