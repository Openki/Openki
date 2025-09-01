# Openki
**Platform for open education** – Free software built with [Meteor.js](https://meteor.com) and [React](https://react.dev/)

An interactive web-platform to provide barrier-free access to education for everyone.
Openki is a simple to use open-source tool for local, self-organized knowledge-exchange:
As a foundation for mediating non-commercial education opportunities,
as interface between people who are interested in similar subjects,
and as an instrument which simplifies the organization of “peer-to-peer” sharing of knowledge.

<div align="center"><img src="https://cloud.githubusercontent.com/assets/9354955/8768227/87a178c6-2e78-11e5-8ba8-a35c834ecda3.png" width="590" alt="arrow diagram showing connection between individuals, comunities, event-locations and calendars"></div>
<br>
Beside the longterm public installations, Openki can be used at unconferences, BarCamps as well as in democratic schools and participatory festivals.

[ read on...](https://about.openki.net "our blog")

<div align="right"> (★ Star us if you like the idea)</div>

### Use or try it
Live: [openki.net](https://openki.net)  
Demo / playground: [sandbox.openki.net](https://sandbox.openki.net/?region=Englistan "running here")  
Pre-release: [dev.openki.net](https://dev.openki.net)

---

### Features



- Easily propose topics and events
- Simple discussion board per course
- Extendable participant roles
- Categories with sub-categories
- Regions and venue system
- Groups-, community- and program functionality with filters



Openki has multiple features that are not visible at first sight in the frontend

<details><summary>Click to see more features</summary>


**Integrations:**

- :computer: Kiosk screen views with upcoming events ([docs](https://gitlab.com/Openki/Openki/wikis/InfoScreens))
- :pager: Iframe-URLs to dynamically embed views into other pages ([docs](https://gitlab.com/Openki/Openki/wikis/Frames))
- :date: Calendar and iCal exports ([docs](https://gitlab.com/Openki/Openki/wikis/calendar-export))
- :key: Single-Sign-on (OAuth: Facebook, Google, GitHub...)
- :ideograph_advantage: I18n: GUI for crowdsourced translation (using [Weblate](https://hosted.weblate.org/projects/openki/openki/)) ([docs](https://gitlab.com/Openki/Openki/-/wikis/i18n))
- :electric_plug: JSON API, read-only ([docs](https://gitlab.com/Openki/Openki/-/wikis/JSON-API))

**Further:**

- :envelope: E-mail notifications
- :mailbox: Private messaging
- :open_file_folder: File upload
- :mag: Fulltext-search
- :iphone: Responsive design
- :bar_chart: Statistics and evaluation
- :door: multitenancy (internal, private usage)
- :ghost: Customizability and some white labeling

**Intended, upcomming features:**
- :white_large_square: White-labeling per groups, organizations and regions
- :chart_with_upwards_trend: Visual statistics
- :closed_lock_with_key: More privacy settings
- :heavy_check_mark: Voting-/polling-system, fix-a-date schedules
- :iphone: Smartphone App
- ...see more in our [issues](https://gitlab.com/Openki/Openki/-/issues/?sort=milestone&state=opened&not%5Blabel_name%5D%5B%5D=defect%3A%3Anot%20urgent&not%5Blabel_name%5D%5B%5D=defect%3A%3A&not%5Blabel_name%5D%5B%5D=urgent%20%E2%98%A0&label_name%5B%5D=size%3A%3Abig&first_page_size=20).

_Please upvote new features you would like to see or propose new ones._
</details>

---

## Contribution
Code submissions are welcome. To submit a change, [fork this repo](https://gitlab.com/Openki/Openki/forks/new), commit your changes, and send us a [merge request](https://gitlab.com/Openki/Openki/merge_requests/new).<br />
In the interest of having an open and welcoming environment for everyone, we agreed on our [Code of Conduct](https://gitlab.com/Openki/Openki/wikis/Code-of-Conduct). By participating in this project you agree to abide by its terms.

### Installation (Linux, OSX and Windows)
1) To install Meteor locally, run: `curl https://install.meteor.com | sh` (or download the [installer for Windows](https://install.meteor.com/windows))
1) [Download and unzip](https://gitlab.com/Openki/Openki/-/archive/main/Openki-main.zip) or `git clone https://gitlab.com/Openki/Openki.git` Openki repository into `/some/path`.
1) `cd /some/path/Openki`
1) `meteor npm install -verbose` (sometimes twice)
1) Run `meteor npm run debug -verbose` (We support server side debugging. For help, see: https://nodejs.org/en/docs/inspector)
1) Find Openki running on [http://localhost:3000](http://localhost:3000/)

Admin user is called `greg` with pass: `greg`, any other visible user has pass `greg` as well.
Further reading in our [wiki](https://gitlab.com/Openki/Openki/-/wikis/Docs%20for%20developers)

### Fixing weird errors
In case you get weird errors when starting (eg. error 14) try this command:

    meteor npm run reset

### Running the tests
Run tests with:
`meteor npm run test` for both unit and integration tests. See: https://guide.meteor.com/testing
or
`meteor npm run test:integration:watch`

Add `--grep=<pattern>` at the end to only run tests that match the pattern. eg. `meteor npm run test:integration:watch --grep="Propose course via frame"`

**Note:** To run the integration tests, you need a `chromedriver` binary. On Debian, you can get one with `apt install chromuim-driver`. Also make sure to run `meteor npm install`.

Run linters and formatting with these commands:

    `meteor npm run lint`

### Run auto formatting
Format files and automatically fix fixable problems with these commands:

    meteor npm run lint:fix

**Note:** We use typescript and eslint with prettier for `*.ts,*.tsx` files, stylelint with prettier for `*.scss` files and beautify for `*.html`. You can install their extensions in your IDE to automatically execute the formation when saving.

### Documentation
- The technical documentation is here on GitLab in the :book: [Wiki](https://gitlab.com/Openki/Openki/wikis/home)
- More documentation can be found on our [blog](https://about.openki.net/?page_id=1043)

### Contacts
- Technical Support (only concerning technical and conceptual aspects of the Web Platform): [support_ät_openki.net](mailto:support_ät_openki.net "write us")
- Concerning regions: [regions_ät_openki.net](mailto:regions_ät_openki.net "write us")
- Community (rooms, mentors, communication, etc): [community_ät_openki.net](mailto:community_ät_openki.net "write us")
- Sensitive, security related issues can be reported to the following email: [security_ät_openki.net](mailto:security_ät_openki.net "write us"). Here you get some [more info](https://gitlab.com/Openki/Openki/-/wikis/security) about it.

### Help translating
To help translating, please visit our our [translation guide](https://gitlab.com/Openki/Openki/-/wikis/translation).

<a href="https://gitlab.com/Openki/Openki/-/wikis/translation/">
<img src="https://hosted.weblate.org/widget/openki/287x66-grey.png" alt="Graphical translation status box from Weblate" />
</a>

### License
- [AGPL](https://gitlab.com/Openki/Openki/-/blob/dev/LICENSE) – GNU Affero General Public License 3.0
