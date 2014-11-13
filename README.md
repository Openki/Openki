hmmm
====

**Course-Organization-Platform** built with [Meteor.js](http://meteor.com)

It's a simple open-source tool for local, self-organized knowledge exchange: As the foundation for mediating non-commercial education opportunities, as the interface between people who embrace themselves for similar subjects and as an instrument, which simplifies the organization of a “peer-to-peer” sharing of knowledge.

- Demo: [test.schuel.ch](http://test.schuel.ch/?region=Englistan "runing here")  /play 56k
- Concept: [news.schuel.ch](http://news.schuel.ch "our blog") /play story
- Contact: [schueldev[at]lists.xiala.net](mailto:schueldev[_at_]lists.xiala.net "write us")  /play trololo

![schuel.ch - concept cloud](http://news.schuel.ch/wp-content/uploads/2014/11/141105_GD_wolke_EN-1024x584.png)

### Features
- :pencil: :mag: Propose and fulltext-search courses and events
- :speech_balloon: Simple discussion-board
- :heavy_check_mark: Voting-/polling-system, fix-a-date schedules
- :kissing_cat: Categories with sub-categories
- :house_with_garden: :door: Regions- and room-system
- :mortar_board: Extendable participant roles
- :calendar: :date: Calendar
- :key: Single-Sign-on (OpenID, Github, Facebook, G+, Twitter etc...
- :ideograph_advantage: In-browser-GUI for life i18n
- :envelope: Email notifications

### Intended features
- :closed_lock_with_key: Privacy settings and security
- :open_file_folder: File upload for course-documentation
- :mailbox: Privat messages
- :beginner: :name_badge: OpenBadges
- :ghost: Customizability
- :ticket: Mozzila Persona
- :8ball: Connection to SocialNetworks APIs

### Installation
- [Download](https://github.com/schuel/hmmm/archive/master.zip) and unzip (or clone) Hmmm into /some/path
- `cd /some/path`
- To install Meteor, run:
    - ` curl https://install.meteor.com | sh`
    - (sudo)` apt-get install nodejs`  (mac: install from [nodejs.org](nodejs.org)
    - (sudo)` npm install -g meteorite meteor-messageformat`
    - ` mrt update`
- Run `meteor`
- Browse to http://localhost:3000/

### Compass, or how to work on stylesheets
- install ruby
- `gem install compass`
- install bower `npm install -g bower`
- run `bower install` in project root
- run `compass compile` in project root
- scss/sass files go into sass folder
- compiled css goes to client/css. never edit these files. they are just there for the convenience of the guys without compass :-)

### License
- AGPL `GNU Affero General Public License`