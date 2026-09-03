# Openki

**A free, open‑source platform for peer-to-peer education.**

_Openki lets communities create, share, and discuss learning events in a fully customizable, multilingual environment._

![Diagram of Openki’s community‑centric architecture (individuals, communities, event locations, calendars)](https://cloud.githubusercontent.com/assets/9354955/8768227/87a178c6-2e78-11e5-8ba8-a35c834ecda3.png){: width="590"}

Openki is an interactive web platform that provides barrier‑free access to education for everyone, acting as a simple‑to‑use tool for local, self‑organized knowledge exchange. Beyond public permanent installations, Openki can power **unconferences, BarCamps, democratic schools, and participatory festivals**.  
[ Read on...](https://about.openki.net "our blog")

<div align="right"> (★ Star us if you like the idea)</div>

## Try it!

Live version: [openki.net](https://openki.net)  
Demo playground: [sandbox.openki.net](https://sandbox.openki.net/?region=Spilistan "running here")

---

## Why choose Openki?

**Community‑driven** – anyone can propose topics, host events, and join discussions.  
**Multilingual & extensible** – built‑in i18n, custom roles, and plug‑in‑friendly architecture.  
**Various use cases** – works for long‑term public installations **and** ad‑hoc setups such as unconferences, BarCamps or festivals.

### Core functionalities

- Easily propose topics and events
- Simple discussion board per group
- Extendable participant roles
- Categories with sub-categories
- Regions and venue system
- Organizations-, community- and program functionality with filters

### Features not visible at first sight

<details><summary>Click to see</summary>

**Integrations:**

- :computer: Kiosk screen views with upcoming events ([docs](https://gitlab.com/Openki/Openki/wikis/InfoScreens))
- :pager: Iframe-URLs to dynamically embed views into other pages ([docs](https://gitlab.com/Openki/Openki/wikis/Frames))
- :date: Calendar and iCal exports ([docs](https://gitlab.com/Openki/Openki/wikis/calendar-export))
- :key: Single-Sign-on (OAuth: Facebook, Google, GitHub...)
- :ideograph_advantage: I18n: Crowdsourced translation (using [Weblate](https://hosted.weblate.org/projects/openki/openki/)) ([docs](https://gitlab.com/Openki/Openki/-/wikis/i18n))
- :electric_plug: JSON API for read-only access ([docs](https://gitlab.com/Openki/Openki/-/wikis/JSON-API))

**Further:**

- :envelope: Email notifications
- :mailbox: Private messaging
- :open_file_folder: File upload
- :mag: Full-text search
- :iphone: Responsive design
- :bar_chart: Statistics and evaluation
- :door: multitenancy (internal, private usage)
- :ghost: Customizability and some white-labeling
  - Single event mode ([docs](https://gitlab.com/Openki/Openki/-/wikis/singleEvent))
  - Startpage dashboard ([docs](https://gitlab.com/Openki/Openki/-/wikis/Dashboard-Settings))
  - Custom fields and roles for organizations ([docs](https://gitlab.com/Openki/Openki/-/wikis/Organization-Settings))
  - White-labeling per region ([docs](https://gitlab.com/Openki/Openki/-/wikis/Region-Settings))
    - E.g. set page name, logos and calendar start date per region
    - Feature organizations
    - Customize the start page
    - Configure group background images

**Roadmap & Upcoming Features**

- :white_large_square: White-labeling per organizations, tenants and regions
- :chart_with_upwards_trend: Visual statistics
- :closed_lock_with_key: More privacy settings
- :heavy_check_mark: Voting-/polling-system, fix-a-date schedules
- :iphone: Smartphone App

</details>

---

# Contribution

→ _Please upvote features you would like to see or propose new ones in our [issue tracker](https://gitlab.com/Openki/Openki/-/issues/?sort=milestone&state=opened)._
[Code submissions](https://gitlab.com/Openki/Openki/wikis/Submissions) are warmly welcome, please check out our [Code of Conduct](https://gitlab.com/Openki/Openki/wikis/Code-of-Conduct). To submit a change, check your [Code Contribution Guide for Openki](https://gitlab.com/Openki/Openki/wikis/Submissions).

## Tech Stack

Free software built with love and care. We use:

- [Meteor.js](https://docs.meteor.com/about/what-is.html) (full-stack JavaScript framework)
- Node.js (runtime internally used by Meteor)
- [npm](https://www.npmjs.com/) + Meteor package system
- [MongoDB](https://www.mongodb.com/docs/) (database)
- [TypeScript](https://www.typescriptlang.org/docs/) (front- and backend)
- [React](https://react.dev/reference/react) (frontend UI library)
- [HTML5 / CSS3](https://developer.mozilla.org/en/docs/Web) (frontend)
- [Bootstrap 5](https://getbootstrap.com/docs/) (frontend framework)
- [Font Awesome 6](https://fontawesome.com/v6/search?ic=free-collection)
- [Cypress](https://docs.cypress.io/) (test suite)
- [Matomo](https://matomo.org/help/) (web analytics, formerly Piwik)

### Installation (Linux, macOS and Windows)

1. To install Meteor, run: `curl https://install.meteor.com | sh`  
  (In case you use Windows: download the [Meteor for Windows](https://install.meteor.com/windows) and we recomend using  [Git Bash](https://about.gitlab.com/blog/git-command-line-on-windows-with-git-bash/) as your terminal for development)
1. [Download and unzip](https://gitlab.com/Openki/Openki/-/archive/main/Openki-main.zip) or `git clone https://gitlab.com/Openki/Openki.git` Openki repository into `/some/path`.
1. `cd /some/path/Openki`
1. `meteor npm install --verbose` (sometimes twice)
1. Run `meteor npm run debug --verbose` (We support server side debugging. For help, see [the docs](https://nodejs.org/learn/getting-started/debugging))
1. Find Openki running on [http://localhost:3000](http://localhost:3000/)

Log in: User `greg` is admin and has password: `greg`. Any other visible user has password `greg` as well.  
Further reading in our [docs for devs](https://gitlab.com/Openki/Openki/-/wikis/Docs%20for%20developers).

**Testing & linting**:
See our [testing guide](https://gitlab.com/Openki/Openki/-/wikis/testing) on how to run unit- and integration tests.  
In case you get **weird errors** when starting Openki (eg. error 14), try this command: `meteor npm run reset`

To **submit a change**, [fork this repo](https://gitlab.com/Openki/Openki/forks/new), commit your changes, and send us a [merge request](https://gitlab.com/Openki/Openki/merge_requests/new). In the interest of having an open and welcoming environment for everyone, we agreed on our [Code of Conduct](https://gitlab.com/Openki/Openki/wikis/Code-of-Conduct). By participating in this project you agree to abide by its terms.

# Help translating

Openki uses Weblate for crowdsourced translations.  
[![Graphical translation status box from Weblate](https://hosted.weblate.org/widget/openki/287x66-grey.png)](https://hosted.weblate.org/engage/openki/)  
To help translating, please continue to our [translation guide](https://gitlab.com/Openki/Openki/-/wikis/translation).

# Documentation

- **Technical docs** – detailed architecture, API, and deployment guides: [GitLab Wiki](https://gitlab.com/Openki/Openki/wikis/home)
- **User guide** – walkthrough of core features and UI: [How-to Openki](https://howto.openki.net/?page_id=181)
- **Further info** - more documentation can be found on our [about page](https://about.openki.net/?page_id=1043)

# Support & Contacts

- Technical Support: [support_ät_openki.net](mailto:support_ät_openki.net "write us")
- Region assistance: [regions_ät_openki.net](mailto:regions_ät_openki.net "write us")
- Community Support (rooms, mentors, communication, etc): [community_ät_openki.net](mailto:community_ät_openki.net "write us")
- Security Reports: [security_ät_openki.net](mailto:security_ät_openki.net "write us") (see our [security policy](https://gitlab.com/Openki/Openki/-/wikis/security))

# License

- [AGPL](https://gitlab.com/Openki/Openki/-/blob/dev/LICENSE) – GNU Affero General Public License 3.0
