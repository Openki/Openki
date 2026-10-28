# Unreleased

## Fixes

- Important security updates: Updated to Meteor 3.5.4 which includes updated of several bundled dependencies.
- Bugfixes.
- Accessibility improvements.

# v0.13.2 - 2026-10-22

## Fixes

- **Improved rummage page for touchscreen usability** — Added spacing to prevent the on-screen keyboard from overlapping content on touchscreens and fixed layout issues caused by long lists of cards.
- **Improved accessibility and keyboard navigation** — Improved keyboard usability across panels, buttons, scroll controls, and organization settings, including fixes for missing accessible labels and keyboard event handlers.

# v0.13.1 - 2026-10-01

## Fixes

- **Rummage view layout improvement** — Limit the size of logo in rummage kiosk view.
- **Updated translations** — Added some German translations.

# v0.13.0 - 2026-10-01

## Highlights

- **Private chat history** — Direct messages now show previous messages in a chat-style layout, making it possible to see the communication history with another user.

# v0.12.1 - 2026-09-29

## Fixes

- **Improved region role setup** — Added the missing region role db migration.
- **Updated translations** — Improved the help text for selecting roles and updated German and Swedish translations.

# v0.12.0 - 2026-09-25

## Highlights

- **Generic roles for groups** — Coordination teams can now create custom roles for groups, allowing formats beyond the existing Mentor and Host roles. Users can subscribe to roles such as Moderator, Recorder or Chef. Can be enabled via the region setting with `allowUserCustomRoleCreation: true`. [#1428](https://gitlab.com/Openki/Openki/-/work_items/1428)
- **Improved spam cleanup** — Deleting a spam user now also removes their comments, with the removal recorded in the log. [#1734](https://gitlab.com/Openki/Openki/-/work_items/1734)
- **Better support for non-Western titles** — Fixed empty slugs for events and groups whose titles use Cyrillic or other non-Western characters. [#1872](https://gitlab.com/Openki/Openki/-/work_items/1872)
- **More robust admin log** — Improved handling of high-load situations that could cause the log view to time out. [#2229](https://gitlab.com/Openki/Openki/-/work_items/2229)
- **Tooltip fixes** — Fixed tooltips becoming stuck or appearing in the wrong position after navigation. [#2434](https://gitlab.com/Openki/Openki/-/work_items/2434)
- **Search stability** — Fixed a bug where searching for “pol” could result in a blank page. [#2517](https://gitlab.com/Openki/Openki/-/work_items/2517)
- **Organization notifications** — Fixed missing email notifications when proposing a new group to an organization. [#2524](https://gitlab.com/Openki/Openki/-/work_items/2524)

## Breaking changes

- **Configuration setting renamed:** As part of the generic roles implementation, the `type` field in the settings has been renamed to `id`. Existing deployments need to update their settings file when upgrading. See [MR !2115](https://gitlab.com/Openki/Openki/-/merge_requests/2115) for details. [#1428](https://gitlab.com/Openki/Openki/-/work_items/1428)
