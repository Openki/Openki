hmmm
====

**Platform for open education** – built with [Meteor.js](http://meteor.com)

A interactive web-platform in development with the ambition to facilitate a barrier-free access to education for everyone. It is a simple open-source tool for local, self-organized knowledge exchange: As the foundation for mediating non-commercial education opportunities, as the interface between people who embrace themselves for similar subjects and as an instrument, which simplifies the organization of a “peer-to-peer” sharing of knowledge.
[read on...](http://news.schuel.ch "our blog")

- Demo: [test.schuel.ch](http://test.schuel.ch/?region=Englistan "runing here")
- Concept: [news.schuel.ch](http://news.schuel.ch "our blog")
- Contact: [schuelcore[at]lists.xiala.net](mailto:schuelcore[_at_]lists.xiala.net "write us")

![schuel.ch - concept cloud](http://news.schuel.ch/wp-content/uploads/2014/11/141105_GD_wolke_EN-1024x584.png)
<img src="http://news.schuel.ch/wp-content/uploads/2014/11/141105_GD_wolke_EN-1024x584.png" width="400">

----

### Features
- :pencil: Easily propose courses and events
- :mag: Fulltext-search them
- :speech_balloon: Simple discussion-board
- :heavy_check_mark: Voting-/polling-system, fix-a-date schedules
- :cat: Categories with sub-categories
- :door: Regions- and room-system
- :mortar_board: Extendable participant roles
- :date: Calendar
- :key: Single-Sign-on (OpenID, Github, Facebook, G+, Twitter etc...)
- :ideograph_advantage: In-browser-GUI for life i18n
- :envelope: Email notifications

### Intended features
- :closed_lock_with_key: Privacy settings and security
- :open_file_folder: File upload for course-documentation
- :white_flower: Groups-, community- and program system
- :mailbox: Privat messages
- :name_badge: OpenBadges
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

### Technical documentation
- Might be in the [Wiki](https://github.com/schuel/hmmm/wiki)

### Compass, or how to work on stylesheets
- install ruby
- `gem install compass`
- install bower `npm install -g bower`
- run `bower install` in project root
- run `compass compile` in project root
- scss/sass files go into sass folder
- compiled css goes to client/css. never edit these files. they are just there for the convenience of the guys without compass :-)

### License
AGPL – GNU Affero General Public License