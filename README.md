Openki [![Build Status](https://travis-ci.org/Openki/Openki.svg?branch=master)](https://travis-ci.org/Openki/Openki) [![CII Best Practices](https://bestpractices.coreinfrastructure.org/projects/250/badge)](https://bestpractices.coreinfrastructure.org/projects/250) [![Maintainability](https://api.codeclimate.com/v1/badges/49da9e86d8722b2162b8/maintainability)](https://codeclimate.com/github/Openki/Openki/maintainability)
====

**Platform for open education** – Free software built with [Meteor.js](https://meteor.com)

An interactive web-platform to provide barrier-free access to education for everyone.
It is a simple to use open-source tool for local, self-organized knowledge-exchange:
As a foundation for mediating non-commercial education opportunities,
as interface between people who are interested in similar subjects,
and as an instrument which simplifies the organization of “peer-to-peer” sharing of knowledge.

<div align="center"><img src="https://cloud.githubusercontent.com/assets/9354955/8768227/87a178c6-2e78-11e5-8ba8-a35c834ecda3.png" width="590" alt="arrow diagram showing connection between individuals, comunities, event-locations and calendars"></div>
<br>
Beside the longterm public installations, Openki can be used at unconferences, BarCamps as well as in democratic schools and participatory festivals.

[  read on...](https://about.openki.net "our blog")
<div align="right"> (★ Star us if you like the idea)</div>

- Live: [openki.net](https://openki.net)
- Demo/Playground: [sandbox.openki.net](https://sandbox.openki.net/?region=Englistan "running here")
- Concept: [about.openki.net](https://about.openki.net "our blog")
- Contact: [dev-core[at]lists.openki.net](mailto:dev-core[_at_]lists.openki.net "write us")

----

### Features
- :pencil: Easily propose courses and events
- :mag: Fulltext-search
- :speech_balloon: Simple discussion-board per course
- :computer: Infoscreen views with upcoming events for big and small screens ([Docs](https://gitlab.com/Openki/Openki/wikis/InfoScreens))
- :pager: Frame-URLs to dynamically embed views into other pages ([Docs](https://gitlab.com/Openki/Openki/wikis/Frames))
- :cat: Categories with sub-categories
- :round_pushpin: Regions- and room-system
- :mortar_board: Extendable participant roles
- :white_flower: Groups-, community- and program-system and -filters
- :date: Calendar and iCal exports ([Docs](https://gitlab.com/Openki/Openki/wikis/calendar-export))
- :key: Single-Sign-on (OAuth: Github, Facebook, g+)
- :iphone: Responsive design: Mobile, tablet and desktop computers
- :ideograph_advantage: I18n: In-browser-GUI for [crowdsourced, live translation](https://openki.net/translate) (using [meteor-messageformat](https://github.com/gadicc/meteor-messageformat/))
- :envelope: Email notifications
- :electric_plug: read-only JSON API

#### Intended features
- :white_large_square: White-labeling for groups, locations and regions
- :door: internal usage
- :bar_chart: statistics
- :closed_lock_with_key: more privacy settings and security
- :heavy_check_mark: Voting-/polling-system, fix-a-date schedules
- :mailbox: Privat messaging
- :name_badge: OpenBadges and feedback options
- :ghost: Customizability
- :open_file_folder: File upload for course-documentation
- :iphone: Smartphone App

----

## Contribution
All submissions are welcome. To submit a change, [fork this repo](https://gitlab.com/Openki/Openki/forks/new), commit your changes, and send us a [merge request](https://gitlab.com/Openki/Openki/merge_requests/new).<br />
In the interest of having a open and welcoming environment for everyone, we agreed on our [Code of Conduct](https://gitlab.com/Openki/Openki/wikis/Code-of-Conduct). By participating in this project you agree to abide by its terms.

### Installation (Linux, OSX and Windows)
- To install Meteor locally, run: `curl https://install.meteor.com | sh`  (or download the [installer for Windows](https://install.meteor.com/windows))
- [Download](https://gitlab.com/Openki/Openki/-/archive/master/Openki-master.zip) and unzip or `https://gitlab.com/Openki/Openki.git` Openki into `/some/path`.
- `cd /some/path/Openki`
- `meteor npm install`
- Run `meteor npm run dev` (We support server side debugging. For help, see: https://nodejs.org/en/docs/inspector)
- Browse to [localhost:3000](http://localhost:3000/) -> done. (admin: `greg`/`greg`, any other visible user has pwd `greg` as well)

- There are other actions, for example `meteor npm run es-lint`.


### Running the tests

To run the app-tests, you need a `chromedriver` binary. On Debian, you can get one with  `apt install chromuim-driver`. Also make sure to run `meteor npm install`.

Run tests with:

    meteor npm run app-test

**Note:** Add `--grep=<pattern>` at the end to only run tests that match the pattern. eg. `meteor npm run app-test --grep="Propose course via frame"`

Run linters and type check with these commands:

    meteor npm run type-check
    meteor npm run es-lint
    meteor npm run sass-lint

Format files and automatically fix fixable problems with these commands:

    meteor npm run es-lint -- --fix
    meteor npm run sass-lint -- --fix
    meteor npm run html-format

**Note:** We use typescript and eslint with prettier for *.js files, stylelint with prettier for *.scss files and beautify for *.html. You can install their extensions in your IDE to automatically execute the formation when saving. 

### Fixing weird errors

In case you get weird errors when starting (eg. error 14) try this command:

    meteor reset

#### [ERR_INVALID_CALLBACK]: Callback must be a function. Received undefined
In case you get this error when starting. Create a empty file `server/extracts.msgfmt`.

```
fs.js:145 
  throw new ERR_INVALID_CALLBACK(cb);
  ^
 
TypeError [ERR_INVALID_CALLBACK] [ERR_INVALID_CALLBACK]: Callback must be a function. Received undefined
    at maybeCallback (fs.js:145:9)
    at Object.writeFile (fs.js:1332:14)
    at packages/msgfmt_extract.js:267:14
    at suppressedCallback (fs.js:215:5)
    at FSReqCallback.oncomplete (fs.js:156:23) {
  code: 'ERR_INVALID_CALLBACK'
}
```

See: https://gitlab.com/Openki/Openki/-/issues/1414

### Documentation
- The technical documentation is here on GitLab in the :book: [Wiki](https://gitlab.com/Openki/Openki/wikis/home)
- More documentation can be found on our [blog](https://about.openki.net/?page_id=1043)

### License
- AGPL – GNU Affero General Public License 3.0
