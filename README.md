Openki [![pipeline](https://gitlab.com/Openki/Openki/badges/master/pipeline.svg?ignore_skipped=true)](https://gitlab.com/Openki/Openki/-/pipelines) [![CII Best Practices](https://bestpractices.coreinfrastructure.org/projects/250/badge)](https://bestpractices.coreinfrastructure.org/projects/250) [![Maintainability](https://api.codeclimate.com/v1/badges/49da9e86d8722b2162b8/maintainability)](https://codeclimate.com/github/Openki/Openki/maintainability)
====

**Platform for open education** – Free software built with [Meteor.js](https://meteor.com) and [React](https://react.dev/)

An interactive web-platform to provide barrier-free access to education for everyone.
Openki is a simple to use open-source tool for local, self-organized knowledge-exchange:
As a foundation for mediating non-commercial education opportunities,
as interface between people who are interested in similar subjects,
and as an instrument which simplifies the organization of “peer-to-peer” sharing of knowledge.

<div align="center"><img src="https://cloud.githubusercontent.com/assets/9354955/8768227/87a178c6-2e78-11e5-8ba8-a35c834ecda3.png" width="590" alt="arrow diagram showing connection between individuals, comunities, event-locations and calendars"></div>
<br>
Beside the longterm public installations, Openki can be used at unconferences, BarCamps as well as in democratic schools and participatory festivals.

[  read on...](https://about.openki.net "our blog")
<div align="right"> (★ Star us if you like the idea)</div>


### Test it

- Live: [openki.net](https://openki.net)
- Demo / playground: [sandbox.openki.net](https://sandbox.openki.net/?region=Englistan "running here")
- Beta: [dev.openki.net](https://dev.openki.net)

----

### Features
- :pencil: Easily propose Topics and events
- :mag: Fulltext-search
- :speech_balloon: Simple discussion-board per course
- :computer: Infoscreen views with upcoming events for big and small screens ([Docs](https://gitlab.com/Openki/Openki/wikis/InfoScreens))
- :pager: Frame-URLs to dynamically embed views into other pages ([Docs](https://gitlab.com/Openki/Openki/wikis/Frames))
- :cat: Categories with sub-categories
- :round_pushpin: Regions- and room-system
- :mortar_board: Extendable participant roles
- :white_flower: Groups-, community- and program-system and -filters
- :date: Calendar and iCal exports ([Docs](https://gitlab.com/Openki/Openki/wikis/calendar-export))
- :key: Single-Sign-on (OAuth: Facebook, Google)
- :iphone: Responsive design: Mobile, tablet and desktop computers
- :ideograph_advantage: I18n: In-browser-GUI for [crowdsourced translation](https://gitlab.com/Openki/Openki/-/wikis/i18n) (using [Weblate](https://hosted.weblate.org/projects/openki/openki/))
- :envelope: Email notifications
- :electric_plug: read-only JSON API
- :door: private usage, multitenancy
- :mailbox: Private messaging
- :ghost: Customizability, White Labeling
- :open_file_folder: File upload

#### Intended features
- :white_large_square: White-labeling for groups, locations and regions
- :bar_chart: statistics
- :closed_lock_with_key: more privacy settings
- :heavy_check_mark: Voting-/polling-system, fix-a-date schedules
- :iphone: Smartphone App
- ...see more in our [issues](https://gitlab.com/Openki/Openki/-/issues/?sort=milestone&state=opened&not%5Blabel_name%5D%5B%5D=defect%3A%3Anot%20urgent&not%5Blabel_name%5D%5B%5D=defect%3A%3A&not%5Blabel_name%5D%5B%5D=urgent%20%E2%98%A0&label_name%5B%5D=size%3A%3Abig&first_page_size=20).

----

## Contribution
Submissions are welcome. To submit a change, [fork this repo](https://gitlab.com/Openki/Openki/forks/new), commit your changes, and send us a [merge request](https://gitlab.com/Openki/Openki/merge_requests/new).<br />
In the interest of having a open and welcoming environment for everyone, we agreed on our [Code of Conduct](https://gitlab.com/Openki/Openki/wikis/Code-of-Conduct). By participating in this project you agree to abide by its terms.

### Installation (Linux, OSX and Windows)
- To install Meteor locally, run: `curl https://install.meteor.com | sh`  (or download the [installer for Windows](https://install.meteor.com/windows))
- [Download](https://gitlab.com/Openki/Openki/-/archive/master/Openki-master.zip) and unzip or `https://gitlab.com/Openki/Openki.git` Openki into `/some/path`.
- `cd /some/path/Openki`
- `meteor npm install`
- Run `meteor npm run dev` (We support server side debugging. For help, see: https://nodejs.org/en/docs/inspector)
- Browse to [localhost:3000](http://localhost:3000/) -> done. 

Admin user is called `greg` with pass: `greg`, any other visible user has pass `greg` as well.
Further reading in our [wiki](https://gitlab.com/Openki/Openki/-/wikis/Docs%20for%20developers)

### Running the tests

Run tests with:
    meteor npm run test
    meteor npm run test-live
    meteor npm run app-test

Add `--grep=<pattern>` at the end to only run tests that match the pattern. eg. `meteor npm run test-live --grep="Propose course via frame"`

**Note:**  To run the app-tests, you need a `chromedriver` binary. On Debian, you can get one with  `apt install chromuim-driver`. Also make sure to run `meteor npm install`.

Run linters and type check with these commands:

    meteor npm run type-check
    meteor npm run es-lint
    meteor npm run sass-lint

### Run auto formatting

Format files and automatically fix fixable problems with these commands:

    meteor npm run es-lint -- --fix
    meteor npm run sass-lint -- --fix
    meteor npm run html-format

**Note:** We use typescript and eslint with prettier for *.js files, stylelint with prettier for *.scss files and beautify for *.html. You can install their extensions in your IDE to automatically execute the formation when saving. 

### Fixing weird errors

In case you get weird errors when starting (eg. error 14) try this command:

    meteor npm run reset

### Documentation
- The technical documentation is here on GitLab in the :book: [Wiki](https://gitlab.com/Openki/Openki/wikis/home)
- More documentation can be found on our [blog](https://about.openki.net/?page_id=1043)


### Contact
- Technical Support (only concerning technical and conceptual aspects of the Web Platform): [support_ät_openki.net](mailto:support_ät_openki.net "write us")
- Dev list: [dev-core_ät_lists.openki.net](mailto:dev-core[_ät_]lists.openki.net "write us")
- Concerning regions: [regions_ät_openki.net](mailto:regions_ät_openki.net "write us")
- Community (rooms, mentors, communication, etc): [community_ät_openki.net](mailto:community_ät_openki.net "write us")

### License
- AGPL – GNU Affero General Public License 3.0
