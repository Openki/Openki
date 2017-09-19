Openki [![Build Status](https://travis-ci.org/Openki/Openki.svg?branch=master)](https://travis-ci.org/Openki/Openki) [![CII Best Practices](https://bestpractices.coreinfrastructure.org/projects/250/badge)](https://bestpractices.coreinfrastructure.org/projects/250)
====

**Platform for open education** – Free software built with [Meteor.js](http://meteor.com)

An interactive web-platform to provide barrier-free access to education for everyone.
It is a simple to use open-source tool for local, self-organized knowledge-exchange:
As a foundation for mediating non-commercial education opportunities,
as interface between people who are interested in similar subjects,
and as an instrument which simplifies the organization of “peer-to-peer” sharing of knowledge.

<div align="center"><img src="https://cloud.githubusercontent.com/assets/9354955/8768227/87a178c6-2e78-11e5-8ba8-a35c834ecda3.png" width="590" alt="arrow diagram showing connection between individuals, comunities, event-locations and calendars"></div>
<br>
Beside the longterm public installations, Openki can be used at unconferences, BarCamps as well as in democratic schools and participatory festivals.

[  read on...](http://about.openki.net "our blog")
<div align="right"> (★ Star us if you like the idea)</div>

- Live: [openki.net](https://openki.net)
- Demo/Playground: [sandbox.openki.net](http://sandbox.openki.net/?region=Englistan "running here")
- Concept: [about.openki.net](http://about.openki.net "our blog")
- Contact: [openki-core[at]lists.xiala.net](mailto:openki-core[_at_]lists.xiala.net "write us")

----

### Features
- :pencil: Easily propose courses and events
- :mag: Fulltext-search them
- :speech_balloon: Simple discussion-board
- :computer: Infoscreen: Live-views with upcoming events for big and small screens ([Wiki](https://github.com/Openki/Openki/wiki/InfoScreens))
- :pager: Frame-URLs to dynamically embed views into other pages ([Wiki](https://github.com/Openki/Openki/wiki/Frames))
- :cat: Categories with sub-categories
- :door: Regions- and room-system
- :mortar_board: Extendable participant roles
- :white_flower: Groups-, community- and program-system and -filters
- :date: Calendar and iCal exports ([Wiki](https://github.com/Openki/Openki/wiki/calendar-export))
- :key: Single-Sign-on (OpenID/OAuth: Github, Facebook, g+)
- :iphone: Responsive design: Mobile, tablet and desktop computers
- :ideograph_advantage: I18n: In-browser-GUI for crowdsourced, live translation (using [meteor-messageformat](https://github.com/gadicc/meteor-messageformat/))
- :envelope: Email notifications

#### Intended features
- :white_large_square: White-labeling for groups, locations and regions
- :open_file_folder: File upload for course-documentation
- :closed_lock_with_key: Privacy settings and security
- :heavy_check_mark: Voting-/polling-system, fix-a-date schedules
- :mailbox: Privat messaging
- :name_badge: OpenBadges
- :ghost: Customizability
- :8ball: Connection to SocialNetworks APIs
- :iphone: Smartphone App

----

## Contribution
All submissions are welcome. To submit a change, [fork this repo](https://github.com/Openki/Openki/fork), commit your changes, and send us a [pull request](https://github.com/Openki/Openki/compare).<br />
In the interest of having a open and welcoming environment for everyone, we agreed on our [Code of Conduct](https://github.com/Openki/Openki/wiki/Code-of-Conduct). By participating in this project you agree to abide by its terms.

### Installation (Linux, OSX and Windows)
- To install Meteor locally, run: `curl https://install.meteor.com | sh`  (or download the [installer for Windows](https://install.meteor.com/windows))
- [Download](https://github.com/Openki/Openki/archive/master.zip) and unzip or `git clone https://github.com/Openki/Openki.git` Openki into /some/path.
- `cd /some/path/Openki`
- `meteor npm install`
- Run `meteor npm run dev`
- Browse to [localhost:3000](http://localhost:3000/) -> done. (admin: `greg`/`greg`, any other visible user has pwd `greg` as well)

### Documentation
- The technical documentation is here on Github in the :book: [Wiki](https://github.com/Openki/Openki/wiki)
- More documentation can be found on our [blog](http://about.openki.net/?page_id=1043)

### License
- AGPL – GNU Affero General Public License (for the sourcecode)
- For all course contents and descriptions (if not differently indicated): Creative Commons BY-SA
- For all testing-events descriptions (server/data/testing.events.js): Creative Commons BY-NC-SA
