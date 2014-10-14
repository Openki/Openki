hmmm
====

Is a **Course-Organization-Platform** built with [Meteor.js](http://meteor.com)

- Demo: [http://hmmm.schuel.ch](hmmm.schuel.ch "runing here")
- Concept: [http://news.schuel.ch](news.schuel.ch "our blog")
- Contact: [schueldev[at]lists.xiala.net](mailto:schueldev[_at_]lists.xiala.net "write us")

### Features
- Propose and fulltext-search courses and events
- Simple discussion-board
- Voting-/polling-system, fix-a-date schedules
- Categories with sub-categories
- Regions- and room-system
- Extendable participant roles
- Calendar

### Intended features
- I18n
- Email notifications
- Privacy and Security
- File upload for course-documentation
- Privat messages

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
- Not clear yet. AGPL probably. for the moment it is [WTFPL](http://www.wtfpl.net)
